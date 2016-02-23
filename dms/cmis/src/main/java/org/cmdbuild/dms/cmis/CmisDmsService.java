package org.cmdbuild.dms.cmis;

import static com.google.common.base.Suppliers.memoize;
import static com.google.common.base.Suppliers.synchronizedSupplier;
import static com.google.common.collect.Lists.newArrayList;
import static com.google.common.collect.Maps.newHashMap;
import static org.cmdbuild.dms.MetadataAutocompletion.NULL_AUTOCOMPLETION_RULES;

import java.io.IOException;
import java.io.StringReader;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.activation.DataHandler;
import javax.activation.MimetypesFileTypeMap;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Unmarshaller;
import javax.xml.transform.stream.StreamSource;

import org.apache.chemistry.opencmis.client.api.CmisObject;
import org.apache.chemistry.opencmis.client.api.Document;
import org.apache.chemistry.opencmis.client.api.Folder;
import org.apache.chemistry.opencmis.client.api.ObjectType;
import org.apache.chemistry.opencmis.client.api.Property;
import org.apache.chemistry.opencmis.client.api.Repository;
import org.apache.chemistry.opencmis.client.api.Session;
import org.apache.chemistry.opencmis.client.api.SessionFactory;
import org.apache.chemistry.opencmis.client.runtime.SessionFactoryImpl;
import org.apache.chemistry.opencmis.commons.SessionParameter;
import org.apache.chemistry.opencmis.commons.data.ContentStream;
import org.apache.chemistry.opencmis.commons.definitions.PropertyDefinition;
import org.apache.chemistry.opencmis.commons.enums.BindingType;
import org.apache.chemistry.opencmis.commons.enums.UnfileObject;
import org.apache.chemistry.opencmis.commons.enums.VersioningState;
import org.apache.chemistry.opencmis.commons.exceptions.CmisObjectNotFoundException;
import org.cmdbuild.dms.DefaultDefinitionsFactory;
import org.cmdbuild.dms.DefinitionsFactory;
import org.cmdbuild.dms.DmsConfiguration.ChangeListener;
import org.cmdbuild.dms.DmsService;
import org.cmdbuild.dms.DmsService.LoggingSupport;
import org.cmdbuild.dms.DocumentDelete;
import org.cmdbuild.dms.DocumentDownload;
import org.cmdbuild.dms.DocumentSearch;
import org.cmdbuild.dms.DocumentTypeDefinition;
import org.cmdbuild.dms.DocumentUpdate;
import org.cmdbuild.dms.Metadata;
import org.cmdbuild.dms.MetadataAutocompletion;
import org.cmdbuild.dms.MetadataAutocompletion.AutocompletionRules;
import org.cmdbuild.dms.MetadataDefinition;
import org.cmdbuild.dms.MetadataGroup;
import org.cmdbuild.dms.MetadataGroupDefinition;
import org.cmdbuild.dms.StorableDocument;
import org.cmdbuild.dms.StoredDocument;
import org.cmdbuild.dms.cmis.CmisCustomModel.Converter;
import org.cmdbuild.dms.cmis.CmisCustomModel.DocumentType;
import org.cmdbuild.dms.cmis.CmisCustomModel.Parameter;
import org.cmdbuild.dms.exception.DmsError;

import com.google.common.base.Supplier;

public class CmisDmsService implements DmsService, LoggingSupport, ChangeListener {

	private final CmisDmsConfiguration configuration;
	private DefinitionsFactory definitionsFactory;
	private Supplier<CmisCustomModel> customModel;
	private CmisConverter defaultConverter;
	private Map<String, CmisConverter> propertyConverters;
	private Map<String, PropertyDefinition<?>> cachedPropertyDefinitions;
	private Map<String, DocumentTypeDefinition> cachedDocumentTypeDefinitions;
	private Supplier<Repository> repository;

	public CmisDmsService(final CmisDmsConfiguration configuration) {
		this.configuration = configuration;
		this.configuration.addListener(this);
		configurationChanged();
	}

	@Override
	public void configurationChanged() {
		synchronized (this) {
			repository = synchronizedSupplier(memoize(new Supplier<Repository>() {

				@Override
				public Repository get() {
					logger.info("initializing repository");
					final SessionFactory sessionFactory = SessionFactoryImpl.newInstance();
					final Map<String, String> parameters = newHashMap();
					parameters.put(SessionParameter.ATOMPUB_URL, configuration.getServerURL());
					parameters.put(SessionParameter.BINDING_TYPE, BindingType.ATOMPUB.value());
					parameters.put(SessionParameter.AUTH_HTTP_BASIC, "true");
					parameters.put(SessionParameter.USER, configuration.getAlfrescoUser());
					parameters.put(SessionParameter.PASSWORD, configuration.getAlfrescoPassword());
					parameters.put(SessionParameter.CONNECT_TIMEOUT, Integer.toString(10000));
					parameters.put(SessionParameter.READ_TIMEOUT, Integer.toString(30000));
					if (customModel().getSessionParameters() != null) {
						for (final Parameter param : customModel().getSessionParameters()) {
							parameters.put(param.getName(), param.getValue());
						}
					}
					logger.debug("parameters for repository '{}'", parameters);
					final List<Repository> repositories = sessionFactory.getRepositories(parameters);
					logger.debug("got a repository list with length '{}'", repositories);
					final Repository repository = repositories.get(0);
					logger.debug("will use repository with name '{}'", repository);
					return repository;
				}

			}));
			customModel = synchronizedSupplier(memoize(new Supplier<CmisCustomModel>() {

				@Override
				public CmisCustomModel get() {
					try {
						logger.info("loading custom model from");
						final String content = configuration.getCustomModelFileContent();
						logger.debug("content is '{}'", content);
						final JAXBContext jaxbContext = JAXBContext.newInstance(CmisCustomModel.class);
						final StreamSource xml = new StreamSource(new StringReader(content));
						final Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
						logger.debug("unmarshalling with '{}'", unmarshaller.getClass().getName());
						return unmarshaller.unmarshal(xml, CmisCustomModel.class).getValue();
					} catch (final Exception e) {
						logger.error("error loading custom model", e);
						return new CmisCustomModel();
					}
				}

			}));
			definitionsFactory = new DefaultDefinitionsFactory();
			defaultConverter = new DefaultConverter();

			cachedPropertyDefinitions = null;
			cachedDocumentTypeDefinitions = null;

			propertyConverters = newHashMap();
			if (customModel().getConverterList() != null) {
				for (final Converter converter : customModel().getConverterList()) {
					try {
						final CmisConverter cmisConverter = (CmisConverter) Class.forName(converter.getType())
								.newInstance();
						cmisConverter.setConfiguration(configuration);
						for (final String propertyId : converter.getCmisPropertyId()) {
							logger.debug("Property converter for " + propertyId + cmisConverter.getClass().getName());
							propertyConverters.put(propertyId, cmisConverter);
						}
					} catch (final Exception e) {
						logger.error("Exception loading CMIS converter " + converter.getType(), e);
					}
				}
			}
		}
	}

	private CmisCustomModel customModel() {
		return customModel.get();
	}

	@Override
	public void clearCache() {
		synchronized (this) {
			cachedDocumentTypeDefinitions = null;
		}
	}

	@Override
	public AutocompletionRules getAutoCompletionRules() throws DmsError {
		try {
			final String content = configuration.getMetadataAutocompletionFileContent();
			final AutocompletionRules autocompletionRules;
			if (content != null && !content.isEmpty()) {
				final MetadataAutocompletion.Reader reader = new XmlAutocompletionReader(content);
				autocompletionRules = reader.read();
			} else {
				autocompletionRules = NULL_AUTOCOMPLETION_RULES;
			}
			return autocompletionRules;
		} catch (final Exception e) {
			throw DmsError.forward(e);
		}
	}

	@Override
	public Iterable<DocumentTypeDefinition> getTypeDefinitions() throws DmsError {
		ensureCachedDefinitions();
		return (cachedDocumentTypeDefinitions == null) ? Collections.emptyList()
				: cachedDocumentTypeDefinitions.values();
	}

	@Override
	public List<StoredDocument> search(final DocumentSearch position) throws DmsError {
		ensureCachedDefinitions();
		final Session cmisSession = createSession();
		logger.info("Searching from: " + position.getPath() + "" + position.getClassName() + position.getCardId() + "");
		final List<StoredDocument> results = newArrayList();
		final Folder folder = getFolder(cmisSession, position.getPath());
		logger.debug("In search : got a folder :" + folder);
		if (folder != null) {
			logger.debug("Got children of " + folder.getPath());
			for (final CmisObject child : folder.getChildren()) {
				logger.debug("got a child " + child.getName());

				if (child instanceof Document) {
					final Document cmisDocument = (Document) child;
					logger.debug("child is a cmisDocument " + cmisDocument.getDescription());

					logger.debug("getting paths for " + child.getName());
					String cmisPath = null;
					for (final String path : cmisDocument.getPaths()) {
						if (cmisPath == null) {
							cmisPath = path;
						} else if (!cmisPath.startsWith(folder.getPath()) && path.startsWith(folder.getPath())) {
							cmisPath = path;
						}
					}

					String category = null;
					if (customModel().getCategory() != null) {
						final Property<Object> property = cmisDocument.getProperty(customModel().getCategory());
						if (property != null) {
							category = getConverter(property.getDefinition()).convertFromCmisValue(cmisSession,
									property.getDefinition(), property.getValue());
						}
					}

					String author = null;
					if (customModel().getAuthor() != null) {
						final Property<Object> property = cmisDocument.getProperty(customModel().getAuthor());
						if (property != null) {
							author = getConverter(property.getDefinition()).convertFromCmisValue(cmisSession,
									property.getDefinition(), property.getValue());
						}
					}

					DocumentTypeDefinition documentTypeDefinition = null;
					logger.info("Category of searchd document is " + category);
					if (category != null) {
						documentTypeDefinition = cachedDocumentTypeDefinitions.get(category);
					}
					if (documentTypeDefinition == null) {
						documentTypeDefinition = definitionsFactory.newDocumentTypeDefinitionWithNoMetadata(category);
					}

					final List<MetadataGroup> metadataGroups = newArrayList();
					for (final MetadataGroupDefinition metadataGroupDefinition : documentTypeDefinition
							.getMetadataGroupDefinitions()) {
						final List<Metadata> metadataList = newArrayList();
						for (final MetadataDefinition metadataDefinition : metadataGroupDefinition
								.getMetadataDefinitions()) {
							final CmisMetadataDefinition cmisMetadata = (CmisMetadataDefinition) metadataDefinition;
							final PropertyDefinition<?> propertyDefinition = cmisMetadata.getProperty();
							final Property<Object> property = cmisDocument.getProperty(propertyDefinition.getId());
							logger.info("processing property " + property);
							if (property != null && property.getValue() != null) {
								logger.info("Value of property " + property.getValue());
								final CmisConverter converter = getConverter(propertyDefinition);
								final String value = converter.convertFromCmisValue(cmisSession, propertyDefinition,
										property.getValue());
								logger.info("After conversion Value of property " + value);
								metadataList.add(new CmisMetadata(cmisMetadata.getName(), value));
							}
						}
						metadataGroups.add(new CmisMetadataGroup(metadataGroupDefinition.getName(), metadataList));
					}

					final StoredDocument storedDocument = new StoredDocument();
					storedDocument.setPath(cmisPath.toString());
					storedDocument.setUuid(cmisDocument.getId());
					storedDocument.setName(cmisDocument.getName());
					storedDocument.setDescription(cmisDocument.getDescription());
					storedDocument.setVersion(cmisDocument.getVersionLabel());
					storedDocument.setCreated(cmisDocument.getCreationDate().getTime());
					storedDocument.setModified(cmisDocument.getLastModificationDate().getTime());
					storedDocument.setAuthor(author);
					storedDocument.setCategory(category);
					storedDocument.setMetadataGroups(metadataGroups);

					results.add(storedDocument);
				} else {
					logger.info("Child is not a document: " + child.getName() + " type: " + child.getClass().getName());
				}
			}
		}
		return results;
	}

	@Override
	public DataHandler download(final DocumentDownload document) throws DmsError {
		final Session cmisSession = createSession();
		final Document cmisDocument = getDocument(cmisSession, document.getPath(), document.getFileName());
		return cmisDocument != null ? new DataHandler(new CmisDataSource(cmisDocument.getContentStream())) : null;
	}

	@Override
	public void upload(final StorableDocument document) throws DmsError {
		final Session cmisSession = createSession();
		final Folder folder = createFolder(cmisSession, document.getPath());
		if (folder != null) {
			final MimetypesFileTypeMap mimeTypesMap = new MimetypesFileTypeMap();
			final String mimeType = mimeTypesMap.getContentType(document.getFileName());

			Object author = null;
			if (customModel().getAuthor() != null) {
				final PropertyDefinition<?> propertyDefinition = cachedPropertyDefinitions
						.get(customModel().getAuthor());
				if (propertyDefinition != null) {
					author = getConverter(propertyDefinition).convertToCmisValue(cmisSession, propertyDefinition,
							document.getAuthor());
				}
			}

			Document cmisDocument = getDocument(cmisSession, document.getPath(), document.getFileName());
			if (cmisDocument == null) {
				logger.info("create document");
				final ContentStream contentStream = cmisSession.getObjectFactory()
						.createContentStream(document.getFileName(), -1, mimeType, document.getInputStream());
				final Map<String, Object> properties = getProperties(cmisSession, document, null);
				if (customModel().getAuthor() != null) {
					properties.put(customModel().getAuthor(), author);
				}
				for (final Entry<String, Object> property : properties.entrySet()) {
					logger.debug("Property for document: " + property.toString());
				}
				cmisDocument = folder.createDocument(properties, contentStream, VersioningState.MAJOR);
				logger.info(
						"Document created : " + cmisDocument + "secondary type " + cmisDocument.getSecondaryTypes());

			} else {
				logger.info("update document");
				final Document pwc = (Document) cmisSession.getObject(cmisDocument.checkOut());
				final ContentStream contentStream = cmisSession.getObjectFactory()
						.createContentStream(document.getFileName(), -1, mimeType, document.getInputStream());
				final Map<String, Object> properties = getProperties(cmisSession, document, pwc);
				if (customModel().getAuthor() != null) {
					properties.put(customModel().getAuthor(), author);
				}
				try {
					for (final String p : properties.keySet()) {
						logger.debug("Properties to set " + p + " " + properties.get(p));
					}
					pwc.checkIn(true, properties, contentStream, "");
				} catch (final Exception e) {
					pwc.cancelCheckOut();
					throw DmsError.forward(e);
				} finally {
					try {
						contentStream.getStream().close();
					} catch (final IOException e) {
						throw DmsError.forward(e);
					}
				}
			}
		}

	}

	@Override
	public void updateDescriptionAndMetadata(final DocumentUpdate document) throws DmsError {
		final Session cmisSession = createSession();
		final Folder folder = getFolder(cmisSession, document.getPath());
		if (folder != null) {
			final Document cmisDocument = getDocument(cmisSession, document.getPath(), document.getFileName());
			if (cmisDocument != null) {
				logger.info("Will update document: " + "path: " + cmisDocument.getPaths());
				logger.info("Will get properties for secondary type " + cmisDocument.getSecondaryTypes());
				final Map<String, Object> properties = getProperties(cmisSession, document, cmisDocument);
				cmisDocument.updateProperties(properties);
			}
		}
	}

	@Override
	public void delete(final DocumentDelete document) throws DmsError {
		final Session cmisSession = createSession();
		logger.info("Delete dms document " + (document != null ? document.getFileName() : null));
		final Document cmisDocument = getDocument(cmisSession, document.getPath(), document.getFileName());
		logger.info("Delete cmis document " + (cmisDocument != null ? document.getFileName() : null));
		if (cmisDocument != null) {
			logger.info("Delete cmis document " + cmisDocument.getName());
			cmisDocument.delete(true);
			logger.info("document deleted: " + cmisDocument.getName());
		} else {
			logger.error(
					"No document to delete for " + "path: " + document.getPath() + "name: " + document.getFileName());
		}
	}

	@Override
	public void copy(final StoredDocument document, final DocumentSearch from, final DocumentSearch to)
			throws DmsError {
		final Session cmisSession = createSession();
		logger.info("Trying to get cmid document for cmdbuild doc :" + document.getName());
		final Document cmisDocument = getDocument(cmisSession, from.getPath(), document.getName());
		logger.debug("cmisDocument :" + cmisDocument);
		final Folder toFolder = createFolder(cmisSession, to.getPath());
		logger.debug("folder :" + toFolder);
		if (cmisDocument != null && toFolder != null) {
			logger.debug("folder path" + toFolder.getPath());
			final Map<String, Object> properties = newHashMap();
			for (final Property<?> property : cmisDocument.getProperties()) {
				if (property.getValue() != null) {
					final CmisConverter cmisConverter = propertyConverters.get(property.getId());
					logger.info("Property converter for " + property.getLocalName() + " is " + cmisConverter);
					if (cmisConverter != null && cmisConverter.isAsymmetric()) {
						final String value = cmisConverter.convertFromCmisValue(cmisSession, property.getDefinition(),
								property.getValue());
						final Object cmisValue = cmisConverter.convertToCmisValue(cmisSession, property.getDefinition(),
								value);
						logger.debug("Setting property " + property.getId() + " to " + cmisValue);
						properties.put(property.getId(), cmisValue);
					}
				} else {
					logger.debug("Will not set property " + property.getLocalName() + " as its value is null");
				}
			}
			cmisDocument.copy(toFolder, properties, null, null, null, null, null);
		}
	}

	@Override
	public void move(final StoredDocument document, final DocumentSearch from, final DocumentSearch to)
			throws DmsError {
		final Session cmisSession = createSession();

		logger.info("Move document: " + document.getPath() + "|" + document.getName() + " from :" + from.getPath()
				+ " to " + to.getPath());
		final Folder fromFolder = getFolder(cmisSession, from.getPath());
		final Folder toFolder = createFolder(cmisSession, to.getPath());
		logger.info("Move from Folder: " + fromFolder + "to folder:" + toFolder);
		if (fromFolder != null && toFolder != null) {
			final Document cmisDocument = getDocument(cmisSession, from.getPath(), document.getName());
			if (cmisDocument != null) {
				cmisDocument.move(fromFolder, toFolder);
				logger.info("( Move ) document " + cmisDocument.getName() + "has moved from: " + fromFolder.getName()
						+ " to: " + toFolder.getName());
			} else {
				logger.warn("( Move ) unable to move, cmisdocument does not exists :" + document.getName() + "in "
						+ from.getPath());
			}
		} else {
			logger.warn("( Move ) Either from or to cmis folder is null" + "Cmis From: " + fromFolder + "Cmis To:  "
					+ toFolder);
		}
	}

	@Override
	public void delete(final DocumentSearch position) throws DmsError {
		final Session cmisSession = createSession();
		final Folder folder = getFolder(cmisSession, position.getPath());
		logger.info("will delete  tree '{}'", position.getPath());
		if (folder != null) {
			final List<String> results = folder.deleteTree(true, UnfileObject.DELETE, true);
			for (final String result : results) {
				logger.debug("result " + result);
			}
		}
	}

	@Override
	public void create(final DocumentSearch position) throws DmsError {
		final Session cmisSession = createSession();
		createFolder(cmisSession, position.getPath());
	}

	private Session createSession() {
		return repository.get().createSession();
	}

	private void ensureCachedDefinitions() throws DmsError {
		synchronized (this) {
			if (cachedPropertyDefinitions == null || cachedDocumentTypeDefinitions == null) {
				logger.info("intializing internal cache for document type definitions");
				try {
					final Session cmisSession = createSession();
					final List<ObjectType> types = newArrayList();
					if (customModel().getCmisType() != null) {
						final ObjectType type = cmisSession.getTypeDefinition(customModel().getCmisType());
						logger.info("Caching cmis type definition " + type.getDisplayName());
						if (type != null && type.getPropertyDefinitions() != null) {
							types.add(type);
						}
						if (customModel().getSecondaryTypeList() != null) {
							for (final String name : customModel().getSecondaryTypeList()) {
								logger.info("Caching secondary cmis type definition " + name);
								final ObjectType secondaryType = cmisSession.getTypeDefinition(name);
								if (secondaryType != null && secondaryType.getPropertyDefinitions() != null) {
									types.add(secondaryType);
								}
							}
						}
					}

					final Map<String, PropertyDefinition<?>> cmisPropertyDefinitions = newHashMap();
					for (final String name : Arrays.asList(customModel().getCategory(), customModel().getAuthor(),
							customModel().getDescription())) {
						if (name != null) {
							PropertyDefinition<?> property = null;
							for (final ObjectType baseType : types) {
								if (property == null) {
									property = baseType.getPropertyDefinitions().get(name);
								}
							}
							if (property != null) {
								cmisPropertyDefinitions.put(name, property);
							}
						}
					}
					cachedPropertyDefinitions = cmisPropertyDefinitions;

					final Map<String, DocumentTypeDefinition> cmisDocumentTypes = newHashMap();
					if (customModel().getDocumentTypeList() != null) {
						for (final DocumentType documentType : customModel().getDocumentTypeList()) {
							logger.info("Processing document type defined in customModel " + documentType.getName());
							final List<CmisMetadataGroupDefinition> cmisMetadataGroupDefinitions = newArrayList();
							for (final CmisCustomModel.MetadataGroup metadataGroup : documentType.getGroupList()) {
								final List<CmisMetadataDefinition> cmisMetadataDefinitions = newArrayList();
								ObjectType secondaryType = null;
								if (metadataGroup.getCmisSecondaryTypeId() != null) {
									logger.info("caching " + metadataGroup.getCmisSecondaryTypeId());
									secondaryType = cmisSession
											.getTypeDefinition(metadataGroup.getCmisSecondaryTypeId());
									logger.info("Getting secondary type definition from server for "
											+ metadataGroup.getCmisSecondaryTypeId());
								}
								if (metadataGroup.getMetadataList() != null) {
									for (final CmisCustomModel.Metadata metadata : metadataGroup.getMetadataList()) {
										PropertyDefinition<?> property = null;
										if (secondaryType != null && secondaryType.getPropertyDefinitions() != null) {
											property = secondaryType.getPropertyDefinitions()
													.get(metadata.getCmisPropertyId());
										}
										for (final ObjectType baseType : types) {
											if (property == null) {
												property = baseType.getPropertyDefinitions()
														.get(metadata.getCmisPropertyId());
											}
										}
										if (property != null) {
											final CmisConverter converter = getConverter(property);
											final CmisMetadataDefinition cmisMetadata = new CmisMetadataDefinition(
													metadata.getName(), property, converter.getType(property));
											cmisMetadataDefinitions.add(cmisMetadata);
										}
									}
								} else if (secondaryType != null && secondaryType.getPropertyDefinitions() != null) {
									logger.info(
											"Processing property definitions for " + secondaryType.getDisplayName());
									logger.info("alfrescocustomuri (configuration) is "
											+ configuration.getAlfrescoCustomUri());
									for (final PropertyDefinition<?> property : secondaryType.getPropertyDefinitions()
											.values()) {
										final String localNamespace = property.getLocalNamespace();
										logger.info("Processing property : " + property.getDisplayName()
												+ " ,namespace : " + localNamespace + " ,localname "
												+ property.getLocalName() + " ,queryname " + property.getQueryName());
										if (property.getLocalNamespace().equals(configuration.getAlfrescoCustomUri())) {
											final CmisConverter converter = getConverter(property);
											final CmisMetadataDefinition cmisMetadata = new CmisMetadataDefinition(
													property.getDisplayName(), property, converter.getType(property));
											cmisMetadataDefinitions.add(cmisMetadata);
										}
									}
								}
								if (cmisMetadataDefinitions != null) {
									final CmisMetadataGroupDefinition cmisGroup = new CmisMetadataGroupDefinition(
											metadataGroup.getName(), secondaryType, cmisMetadataDefinitions);
									cmisMetadataGroupDefinitions.add(cmisGroup);
								}
							}
							if (cmisMetadataGroupDefinitions != null) {
								final CmisDocumentType cmisDocumentType = new CmisDocumentType(documentType.getName(),
										cmisMetadataGroupDefinitions);
								cmisDocumentTypes.put(cmisDocumentType.getName(), cmisDocumentType);

							}
						}
					}
					cachedDocumentTypeDefinitions = cmisDocumentTypes;
				} catch (final Exception e) {
					logger.error("error getting document type definitions", e);
					throw DmsError.forward(e);
				}
			}
		}
	}

	private Folder getFolder(final Session cmisSession, final List<String> pathList) {
		CmisObject object = null;
		if (pathList != null) {
			final StringBuilder path = new StringBuilder();
			path.append(configuration.getRepositoryWSPath());
			path.append(configuration.getRepositoryApp());
			for (final String name : pathList) {
				path.append("/");
				path.append(name);
			}
			try {
				object = cmisSession.getObjectByPath(path.toString());
			} catch (final CmisObjectNotFoundException e) {
				object = null;
			}
		}
		return object instanceof Folder ? (Folder) object : null;
	}

	private Folder createFolder(final Session cmisSession, final List<String> pathList) {
		final StringBuilder path = new StringBuilder();
		path.append(configuration.getRepositoryWSPath());
		path.append(configuration.getRepositoryApp());

		final CmisObject object = cmisSession.getObjectByPath(path.toString());
		if (object instanceof Folder && pathList != null) {
			Folder parentFolder = (Folder) object;
			for (final String name : pathList) {
				Folder folder = null;
				try {
					path.append('/');
					path.append(name);
					final CmisObject child = cmisSession.getObjectByPath(path.toString());
					if (child instanceof Folder) {
						folder = (Folder) child;
					}
				} catch (final CmisObjectNotFoundException e) {
					final Map<String, String> properties = newHashMap();
					properties.put("cmis:objectTypeId", "cmis:folder");
					properties.put("cmis:name", name);
					folder = parentFolder.createFolder(properties);
				}
				parentFolder = folder;
			}
			return parentFolder;
		} else {
			return null;
		}
	}

	private Document getDocument(final Session cmisSession, final List<String> pathList, final String filename) {
		CmisObject object = null;
		if (pathList != null && filename != null) {
			final StringBuilder path = new StringBuilder();
			path.append(configuration.getRepositoryWSPath());
			path.append(configuration.getRepositoryApp());
			for (final String name : pathList) {
				path.append("/");
				path.append(name);
			}
			path.append("/");
			path.append(filename);
			try {
				object = cmisSession.getObjectByPath(path.toString());
			} catch (final CmisObjectNotFoundException e) {
				object = null;
			}
		}
		return object instanceof Document ? (Document) object : null;
	}

	private Map<String, Object> getProperties(final Session cmisSession, final DocumentUpdate document,
			final Document cmisDocument) throws DmsError {
		ensureCachedDefinitions();

		final Map<String, Object> properties = newHashMap();
		properties.put("cmis:description", document.getDescription());

		if (customModel().getDescription() != null) {
			final PropertyDefinition<?> propertyDefinition = cachedPropertyDefinitions
					.get(customModel().getDescription());
			logger.info("description property: " + propertyDefinition.getDisplayName() + " updatability "
					+ propertyDefinition.getUpdatability());
			if (propertyDefinition != null) {
				final Object value = getConverter(propertyDefinition).convertToCmisValue(cmisSession,
						propertyDefinition, document.getDescription());
				logger.info("converted property for : " + propertyDefinition.getDisplayName() + " value: " + value);
				properties.put(customModel().getDescription(), value);
			}
		}

		String category = document.getCategory();
		logger.info("Category of document  " + document.getFileName() + " is " + category);
		if (category != null) {
			logger.info("CustomModel for  " + category + " " + customModel().getCategory());
			if (customModel().getCategory() != null) {
				final PropertyDefinition<?> propertyDefinition = cachedPropertyDefinitions
						.get(customModel().getCategory());
				if (propertyDefinition != null) {
					final Object value = getConverter(propertyDefinition).convertToCmisValue(cmisSession,
							propertyDefinition, document.getCategory());
					properties.put(customModel().getCategory(), value);
				}
			}
		} else {
			if (customModel().getCategory() != null) {
				final Property<Object> property = cmisDocument.getProperty(customModel().getCategory());
				if (property != null) {
					category = getConverter(property.getDefinition()).convertFromCmisValue(cmisSession,
							property.getDefinition(), property.getValue());
				}
			}
		}

		if (category != null) {
			logger.info("Processing secondary types  for " + category);
			final List<Object> secondaryTypes = newArrayList();
			if (customModel().getSecondaryTypeList() != null) {
				logger.info("Secondary type list legth:  " + customModel().getSecondaryTypeList().size());
				for (final String secondaryType : customModel().getSecondaryTypeList()) {
					logger.info("Adding secondary types  " + secondaryType);
					secondaryTypes.add(secondaryType);
				}
			} else {
				logger.info("No Secondarytype list   in customModel ");
			}

			final CmisDocumentType documentType = (CmisDocumentType) cachedDocumentTypeDefinitions.get(category);
			if (documentType != null) {
				for (final MetadataGroupDefinition group : documentType.getMetadataGroupDefinitions()) {
					final CmisMetadataGroupDefinition cmisGroup = (CmisMetadataGroupDefinition) group;
					if (cmisGroup.getSecondaryType() != null) {
						secondaryTypes.add(cmisGroup.getSecondaryType().getId());
						logger.info("Adding secondary types  from metadata" + cmisGroup.getSecondaryType().getId());
					}
				}

				if (document.getMetadataGroups() != null) {
					for (final MetadataGroup group : document.getMetadataGroups()) {
						logger.info("Processing group " + group.getName());
						final CmisMetadataGroupDefinition groupDefinition = documentType
								.getMetadataGroupDefinition(group.getName());
						if (groupDefinition != null && group.getMetadata() != null) {
							for (final Metadata metadata : group.getMetadata()) {
								final CmisMetadataDefinition metadataDefinition = groupDefinition
										.getMetadataDefinition(metadata.getName());
								if (metadataDefinition != null) {
									final PropertyDefinition<?> propertyDefinition = metadataDefinition.getProperty();
									final CmisConverter converter = getConverter(propertyDefinition);
									final Object value = converter.convertToCmisValue(cmisSession, propertyDefinition,
											metadata.getValue());
									properties.put(metadataDefinition.getProperty().getId(), value);
								}
							}
						} else {
							logger.info("Either group definition or group.getMetadata() is null");
							logger.info(" group definition " + groupDefinition + " group.getMetadata :"
									+ group.getMetadata());
						}
					}
				} else {
					logger.info("No group metadata for" + document.getFileName());
				}
			}
			logger.warn("CMISDOCUMENT " + cmisDocument);

			if (cmisDocument != null) {
				logger.info("cmisdocument : " + cmisDocument.getPaths());
				if (cmisDocument.getSecondaryTypes() != null) {
					for (final ObjectType secondaryType : cmisDocument.getSecondaryTypes()) {
						logger.warn("SECONDARY TYPE NAMESPACE" + secondaryType.getLocalNamespace());
						if (!secondaryType.getLocalNamespace().equals(configuration.getAlfrescoCustomUri())) {
							if (!secondaryTypes.contains(secondaryType.getId())) {
								secondaryTypes.add(secondaryType.getId());
							}
						}
					}
				}
			} else {
				logger.info("cmisdocument is null");
			}

			properties.put("cmis:secondaryObjectTypeIds", secondaryTypes);
		}

		if (cmisDocument == null) {
			properties.put("cmis:objectTypeId",
					customModel().getCmisType() != null ? customModel().getCmisType() : "cmis:document");
			properties.put("cmis:name", document.getFileName());
		}

		return properties;
	}

	private CmisConverter getConverter(final PropertyDefinition<?> property) {
		logger.debug("Getting converter for: " + property.getDisplayName());
		final CmisConverter converter = propertyConverters.get(property.getId());
		final CmisConverter result = converter != null ? converter : defaultConverter;
		logger.debug("Getconverter for:" + property.getDisplayName() + " is " + result);
		return result;
	}
}
