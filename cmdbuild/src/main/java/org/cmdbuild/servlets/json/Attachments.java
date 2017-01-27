package org.cmdbuild.servlets.json;

import static org.apache.commons.lang3.ObjectUtils.defaultIfNull;
import static org.cmdbuild.servlets.json.CommunicationConstants.CARD_ID;
import static org.cmdbuild.servlets.json.CommunicationConstants.CLASS_NAME;
import static org.cmdbuild.servlets.json.CommunicationConstants.DESCRIPTION;
import static org.cmdbuild.servlets.json.CommunicationConstants.ID;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.activation.DataHandler;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.lang3.StringUtils;
import org.cmdbuild.dms.DefaultDefinitionsFactory;
import org.cmdbuild.dms.DefinitionsFactory;
import org.cmdbuild.dms.DocumentTypeDefinition;
import org.cmdbuild.dms.Metadata;
import org.cmdbuild.dms.MetadataDefinition;
import org.cmdbuild.dms.MetadataGroup;
import org.cmdbuild.dms.MetadataGroupDefinition;
import org.cmdbuild.dms.StoredDocument;
import org.cmdbuild.exception.CMDBException;
import org.cmdbuild.exception.DmsException;
import org.cmdbuild.logic.dms.DmsLogic;
import org.cmdbuild.services.json.dto.JsonResponse;
import org.cmdbuild.servlets.json.serializers.Attachments.JsonAttachmentsContext;
import org.cmdbuild.servlets.json.serializers.Attachments.JsonCategoryDefinition;
import org.cmdbuild.servlets.json.serializers.Serializer;
import org.cmdbuild.servlets.utils.Parameter;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.annotate.JsonProperty;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Lists;

public class Attachments extends JSONBaseWithSpringContext {

	private static class MetadataImpl implements DmsLogic.Metadata {

		private final String category;
		private final String description;
		private final Map<String, Map<String, Object>> metadataValues;
		private final DocumentTypeDefinition documentTypeDefinition;

		private MetadataImpl(final String category, final String description,
				final Map<String, Map<String, Object>> metadataValues,
				final DocumentTypeDefinition documentTypeDefinition) {
			this.category = category;
			this.description = description;
			this.metadataValues = metadataValues;
			this.documentTypeDefinition = documentTypeDefinition;
		}

		@Override
		public String category() {
			return category;
		}

		@Override
		public String description() {
			return description;
		}

		@Override
		public Iterable<MetadataGroup> metadataGroups() {
			return metadataGroupsFrom(documentTypeDefinition, metadataValues);
		}

		private static List<MetadataGroup> metadataGroupsFrom(final DocumentTypeDefinition documentTypeDefinition,
				final Map<String, Map<String, Object>> metadataValues) {
			final List<MetadataGroup> metadataGroups = Lists.newArrayList();
			for (final MetadataGroupDefinition metadataGroupDefinition : documentTypeDefinition
					.getMetadataGroupDefinitions()) {
				final String groupMame = metadataGroupDefinition.getName();
				final Map<String, Object> allMetadataMap = metadataValues.get(groupMame);
				if (allMetadataMap == null) {
					continue;
				}

				metadataGroups.add(new MetadataGroup() {

					@Override
					public String getName() {
						return groupMame;
					}

					@Override
					public Iterable<Metadata> getMetadata() {
						final List<Metadata> metadata = Lists.newArrayList();
						for (final MetadataDefinition metadataDefinition : metadataGroupDefinition
								.getMetadataDefinitions()) {
							final String metadataName = metadataDefinition.getName();
							final Object rawValue = allMetadataMap.get(metadataName);
							metadata.add(new Metadata() {

								@Override
								public String getName() {
									return metadataName;
								}

								@Override
								public String getValue() {
									return (rawValue == null) ? StringUtils.EMPTY : rawValue.toString();
								}

							});
						}
						return metadata;
					}
				});

			}
			return metadataGroups;
		}

	}

	private static final ObjectMapper mapper = new ObjectMapper();

	private final DefinitionsFactory definitionsFactory;

	public Attachments() {
		definitionsFactory = new DefaultDefinitionsFactory();
	}

	@JSONExported
	public JsonResponse getAttachmentsContext() {
		final List<JsonCategoryDefinition> jsonCategories = Lists.newArrayList();
		for (final DocumentTypeDefinition element : dmsLogic().getConfiguredCategoryDefinitions()) {
			jsonCategories.add(JsonCategoryDefinition.from(element));
		}
		return JsonResponse.success(JsonAttachmentsContext.from(jsonCategories));
	}

	@JSONExported
	public JSONObject getAttachmentList( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId //
	) throws JSONException, CMDBException {
		final List<StoredDocument> attachments = dmsLogic().search(className, cardId);
		final JSONArray rows = new JSONArray();
		for (final StoredDocument attachment : attachments) {
			rows.put(new Serializer().serializeAttachment(attachment));
		}

		final JSONObject out = new JSONObject();
		out.put("rows", rows);
		return out;
	}

	@JSONExported
	public DataHandler downloadAttachment( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId, //
			@Parameter("Filename") final String filename, //
			@Parameter(value = "Version", required = false) final String version //
	) throws CMDBException {
		return dmsLogic().download(className, cardId, filename, version);
	}

	@JSONExported
	public void uploadAttachment( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId, //
			@Parameter("File") final FileItem file, //
			@Parameter("Category") final String category, //
			@Parameter("Description") final String description, //
			@Parameter("Metadata") final String jsonMetadataValues, //
			@Parameter(value = "Major", required = false) final Boolean major //
	) throws CMDBException, IOException {
		final Map<String, Map<String, Object>> metadataValues = metadataValuesFromJson(jsonMetadataValues);
		final String username = operationUser().getAuthenticatedUser().getUsername();
		dmsLogic().create( //
				username, //
				className, //
				cardId, //
				file.getInputStream(), //
				removeFilePath(file.getName()), //
				new MetadataImpl(category, description, metadataValues, categoryDefinition(category)), //
				defaultIfNull(major, false) //
		);
	}

	/**
	 * Needed by Internet Explorer that uploads the file with full path
	 */
	private String removeFilePath(final String name) {
		final int backslashIndex = name.lastIndexOf("\\");
		final int slashIndex = name.lastIndexOf("/");
		final int fileNameIndex = Math.max(slashIndex, backslashIndex) + 1;
		return name.substring(fileNameIndex);
	}

	@JSONExported
	public void modifyAttachment( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId, //
			@Parameter("Filename") final String filename, //
			@Parameter(value = "File", required = false) final FileItem file, //
			@Parameter("Category") final String category, //
			@Parameter("Description") final String description, //
			@Parameter("Metadata") final String jsonMetadataValues, //
			@Parameter(value = "Major", required = false) final Boolean major //
	) throws CMDBException, IOException {
		final Map<String, Map<String, Object>> metadataValues = metadataValuesFromJson(jsonMetadataValues);
		dmsLogic().update( //
				operationUser().getAuthenticatedUser().getUsername(), //
				className, //
				cardId, //
				file == null ? null : file.getInputStream(), //
				filename, //
				new MetadataImpl(category, description, metadataValues, categoryDefinition(category)), //
				defaultIfNull(major, false) //
		);
	}

	@JSONExported
	public void deleteAttachment( //
			@Parameter("Filename") final String filename, //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId //
	) throws CMDBException {
		dmsLogic().delete(className, cardId, filename);
	}

	/*
	 * Utilities
	 */

	/**
	 * At the first level there are the metadataGroups For each metadataGroups,
	 * there is another map with the values for the group
	 */
	@SuppressWarnings("unchecked")
	private Map<String, Map<String, Object>> metadataValuesFromJson(final String jsonMetadataValues)
			throws IOException, JsonParseException, JsonMappingException {
		return mapper.readValue(jsonMetadataValues, Map.class);
	}

	private DocumentTypeDefinition categoryDefinition(final String category) {
		try {
			return dmsLogic().getCategoryDefinition(category);
		} catch (final DmsException e) {
			notifier().warn(e);
			return definitionsFactory.newDocumentTypeDefinitionWithNoMetadata(category);
		}
	}

	private static class Preset {

		private final String id;
		private final String description;

		public Preset(final String id, final String description) {
			this.id = id;
			this.description = description;
		}

		@JsonProperty(ID)
		public String getId() {
			return id;
		}

		@JsonProperty(DESCRIPTION)
		public String getDescription() {
			return description;
		}

	}

	@JSONExported
	public JsonResponse getPresets() throws CMDBException {
		final List<Preset> elements = dmsLogic().presets().entrySet().stream()
				.map(t -> new Preset(t.getKey(), t.getValue())).collect(Collectors.toList());
		return JsonResponse.success(elements);
	}

	@JSONExported
	public JSONObject getAttachmentVersions( //
			@Parameter(CLASS_NAME) final String className, //
			@Parameter(CARD_ID) final Long cardId, //
			@Parameter("Filename") final String filename //
	) throws JSONException, CMDBException {
		final JSONArray rows = new JSONArray();
		dmsLogic().searchVersions(className, cardId, filename) //
				.forEach(input -> rows.put(new Serializer().serializeAttachment(input)));
		final JSONObject out = new JSONObject();
		out.put("rows", rows);
		return out;
	}

}
