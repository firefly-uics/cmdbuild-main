package org.cmdbuild.services.localization;

import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.apache.commons.lang3.StringUtils.defaultIfBlank;
import static org.apache.commons.lang3.StringUtils.isBlank;

import org.cmdbuild.dao.entry.ForwardingAttribute;
import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.entrytype.CMEntryTypeVisitor;
import org.cmdbuild.dao.entrytype.CMFunctionCall;
import org.cmdbuild.logic.translation.TranslationFacade;
import org.cmdbuild.logic.translation.TranslationObject;
import org.cmdbuild.logic.translation.converter.AttributeConverter;

class LocalizedAttribute extends ForwardingAttribute {

	private final CMAttribute delegate;
	private final TranslationFacade facade;
	private final String entryType;

	private static final String DESCRIPTION = AttributeConverter.CLASSATTRIBUTE_DESCRIPTION.fieldName();
	private static final String GROUP = AttributeConverter.CLASSATTRIBUTE_GROUP.fieldName();
	private static final String CLASS = AttributeConverter.CLASSATTRIBUTE_DESCRIPTION.entryType();
	private static final String DOMAIN = AttributeConverter.DOMAINATTRIBUTE_DESCRIPTION.entryType();

	LocalizedAttribute(final CMAttribute delegate, final TranslationFacade facade) {
		this.delegate = delegate;
		this.facade = facade;
		entryType = new CMEntryTypeVisitor() {

			String entryTypeKey = EMPTY;

			@Override
			public void visit(final CMFunctionCall type) {
				throw new UnsupportedOperationException();

			}

			@Override
			public void visit(final CMDomain type) {
				entryTypeKey = DOMAIN;
			}

			@Override
			public void visit(final CMClass type) {
				entryTypeKey = CLASS;
			}

			public String getEntryType(final CMEntryType entryType) {
				entryType.accept(this);
				return entryTypeKey;
			}
		}.getEntryType(getOwner());
	}

	@Override
	protected CMAttribute delegate() {
		return delegate;
	}

	@Override
	public String getGroup() {

		final String entryTypeName = getOwner().getName();
		final String attributeName = getName();

		String translatedGroup = facade.read(AttributeConverter.of(entryType, GROUP) //
				.create(entryTypeName, attributeName));

		if (isBlank(translatedGroup)) {
			translatedGroup = searchGroupTranslationFromOtherAttributes(this);
		}

		if (isBlank(translatedGroup)) {
			translatedGroup = new CMEntryTypeVisitor() {

				String translatedGroup = EMPTY;

				@Override
				public void visit(final CMFunctionCall type) {
					// nothing to do
				}

				@Override
				public void visit(final CMDomain type) {
					// nothing to do
				}

				@Override
				public void visit(final CMClass type) {
					translatedGroup = inheritTranslationOfField(GROUP);
				}

				public String inheritedTranslation(final CMEntryType owner) {
					owner.accept(this);
					return translatedGroup;
				}
			}.inheritedTranslation(getOwner());
		}
		return defaultIfBlank(translatedGroup, super.getGroup());
	}

	@Override
	public String getDescription() {

		final String entryTypeName = getOwner().getName();
		final String attributeName = getName();

		String translatedDescription = facade.read(AttributeConverter.of(entryType, DESCRIPTION) //
				.create(entryTypeName, attributeName));

		if (isBlank(translatedDescription)) {
			translatedDescription = new CMEntryTypeVisitor() {

				String translatedGroup;

				@Override
				public void visit(final CMFunctionCall type) {
					// nothing to do
				}

				@Override
				public void visit(final CMDomain type) {
					// nothing to do
				}

				@Override
				public void visit(final CMClass type) {
					type.accept(this);
					translatedGroup = inheritTranslationOfField(GROUP);
				}

				public String inheritedTranslation() {
					return translatedGroup;
				}
			}.inheritedTranslation();
		}
		return defaultIfBlank(translatedDescription, super.getDescription());
	}

	private String searchGroupTranslationFromOtherAttributes(final CMAttribute attribute) {
		final String groupName = delegate.getGroup();
		if (isBlank(groupName)) {
			return EMPTY;
		}
		final CMEntryType owner = getOwner();

		final String translatedGroupName = new CMEntryTypeVisitor() {

			String translatedGroupName;
			String groupName;

			public String searchGroupNameTranslation(final CMEntryType owner, final String groupName) {
				this.groupName = groupName;
				owner.accept(this);
				return translatedGroupName;
			}

			@Override
			public void visit(final CMFunctionCall type) {
				throw new UnsupportedOperationException();
			}

			@Override
			public void visit(final CMDomain type) {
				throw new UnsupportedOperationException();
			}

			@Override
			public void visit(final CMClass type) {
				final Iterable<? extends CMAttribute> allAttributes = owner.getAttributes();
				for (final CMAttribute attribute : allAttributes) {
					if (!groupName.equals(attribute.getGroup())) {
						continue;
					}

					final String groupNameTranslation = facade.read(AttributeConverter.of(CLASS, GROUP) //
							.create(owner.getName(), attribute.getName()));
					if (!isBlank(groupNameTranslation)) {
						translatedGroupName = groupNameTranslation;
						break;
					}
				}
			}
		}.searchGroupNameTranslation(owner, groupName);
		return translatedGroupName;
	}

	public String inheritTranslationOfField(final String field) {
		final CMEntryType attributeOwner = getOwner();
		return inheritTranslationFromAllAncestors((CMClass) attributeOwner, field);
	}

	private String inheritTranslationFromAllAncestors(final CMClass entryType, final String field) {
		String inheritedTranslation = EMPTY;
		final CMClass parent = entryType.getParent();
		if (parent != null) {
			final CMAttribute inheritedAttribute = parent.getAttribute(getName());
			if (inheritedAttribute != null) {
				final AttributeConverter converter = AttributeConverter.of(CLASS, field);
				final TranslationObject translationObject = converter.create(parent.getName(), getName());
				inheritedTranslation = facade.read(translationObject);
				if (isBlank(inheritedTranslation)) {
					inheritedTranslation = inheritTranslationFromAllAncestors(parent, field);
				}
			}
		}
		return inheritedTranslation;
	}

}
