package org.cmdbuild.logic.data;

import org.cmdbuild.dao.entrytype.CMAttribute;
import org.cmdbuild.dao.entrytype.CMAttribute.Mode;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMEntryType;
import org.cmdbuild.dao.entrytype.attributetype.CMAttributeType;
import org.cmdbuild.dao.view.CMAttributeDefinition;
import org.cmdbuild.dao.view.CMClassDefinition;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.exception.ORMException;
import org.cmdbuild.exception.ORMException.ORMExceptionType;
import org.cmdbuild.logic.Logic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

/**
 * Business Logic Layer for data definition.
 */
@Component
public class DataDefinitionLogic implements Logic {

	private static CMClass NO_PARENT = null;

	private final CMDataView view;

	@Autowired
	public DataDefinitionLogic(@Qualifier("user") final CMDataView dataView) {
		this.view = dataView;
	}

	public CMClass createOrUpdateClass(final ClassDTO classDTO) {
		logger.info("creating or updating class: {}", classDTO);

		final CMClass existingClass = view.findClassByName(classDTO.getName());

		final Long parentId = classDTO.getParentId();
		final CMClass parentClass = (parentId == null) ? NO_PARENT : view.findClassById(parentId.longValue());

		final CMClass createdOrUpdatedClass;
		if (existingClass == null) {
			logger.info("class not already created, creating a new one");
			createdOrUpdatedClass = view.createClass(definitionForNew(classDTO, parentClass));
		} else {
			logger.info("class already created, updating existing one");
			createdOrUpdatedClass = view.updateClass(definitionForExisting(classDTO, existingClass));
		}
		return createdOrUpdatedClass;
	}

	private CMClassDefinition definitionForNew(final ClassDTO classDTO, final CMClass parentClass) {
		return new CMClassDefinition() {

			@Override
			public Long getId() {
				return null;
			}

			@Override
			public String getName() {
				return classDTO.getName();
			}

			@Override
			public String getDescription() {
				return classDTO.getDescription();
			}

			@Override
			public CMClass getParent() {
				return parentClass;
			}

			@Override
			public boolean isSuperClass() {
				return classDTO.isSuperClass();
			}

			@Override
			public boolean isHoldingHistory() {
				return classDTO.isHoldingHistory();
			}

			@Override
			public boolean isActive() {
				return classDTO.isActive();
			}

		};
	}

	private CMClassDefinition definitionForExisting(final ClassDTO classDTO, final CMClass existingClass) {
		return new CMClassDefinition() {

			@Override
			public Long getId() {
				return existingClass.getId();
			}

			@Override
			public String getName() {
				return existingClass.getName();
			}

			@Override
			public String getDescription() {
				return classDTO.getDescription();
			}

			@Override
			public CMClass getParent() {
				return existingClass.getParent();
			}

			@Override
			public boolean isSuperClass() {
				return existingClass.isSuperclass();
			}

			@Override
			public boolean isHoldingHistory() {
				return existingClass.holdsHistory();
			}

			@Override
			public boolean isActive() {
				return classDTO.isActive();
			}

		};
	}

	public void deleteOrDeactivateClass(final ClassDTO classDTO) {
		logger.info("deleting class: {}", classDTO.toString());
		final CMClass existingClass = view.findClassByName(classDTO.getName());
		if (existingClass == null) {
			logger.warn("class '{}' not found", classDTO.getName());
			return;
		}
		try {
			logger.warn("deleting existing class '{}'", classDTO.getName());
			view.deleteClass(existingClass);
		} catch (final ORMException e) {
			logger.error("error deleting class", e);
			if (e.getExceptionType() == ORMExceptionType.ORM_CONTAINS_DATA) {
				logger.warn("class contains data");
				view.updateClass(unactive(existingClass));
			}
			throw e;
		}

	}

	public CMAttribute createOrUpdateAttribute(final AttributeDTO attributeDTO) {
		logger.info("creating or updating attribute: {}", attributeDTO.toString());

		final CMClass owner = view.findClassById(attributeDTO.getOwner());
		final CMAttribute existingAttribute = owner.getAttribute(attributeDTO.getName());

		final CMAttribute createdOrUpdatedAttribute;
		if (existingAttribute == null) {
			logger.info("attribute not already created, creating a new one");
			createdOrUpdatedAttribute = view.createAttribute(definitionForNew(attributeDTO, owner));
		} else {
			logger.info("attribute already created, updating existing one");
			createdOrUpdatedAttribute = view.updateAttribute(definitionForExisting(attributeDTO, existingAttribute));
		}
		return createdOrUpdatedAttribute;
	}

	public void deleteOrDeactivateAttribute(final AttributeDTO attributeDTO) {
		logger.info("deleting attribute: {}", attributeDTO.toString());
		final CMClass owner = view.findClassById(attributeDTO.getOwner());
		final CMAttribute attribute = owner.getAttribute(attributeDTO.getName());
		if (attribute == null) {
			logger.warn("attribute '{}' not found", attributeDTO.getName());
			return;
		}
		try {
			logger.warn("deleting existing attribute '{}'", attributeDTO.getName());
			view.deleteAttribute(attribute);
		} catch (final ORMException e) {
			logger.error("error deleting attribute", e);
			if (e.getExceptionType() == ORMExceptionType.ORM_CONTAINS_DATA) {
				logger.warn("attribute contains data");
				view.updateAttribute(unactive(attribute));
			}
			throw e;
		}
	}

	private CMAttributeDefinition definitionForNew(final AttributeDTO attributeDTO, final CMEntryType owner) {
		return new CMAttributeDefinition() {

			@Override
			public String getName() {
				return attributeDTO.getName();
			}

			@Override
			public CMEntryType getOwner() {
				return owner;
			}

			@Override
			public CMAttributeType<?> getType() {
				return attributeDTO.getType();
			}

			@Override
			public String getDescription() {
				return attributeDTO.getDescription();
			}

			@Override
			public String getDefaultValue() {
				return attributeDTO.getDefaultValue();
			}

			@Override
			public boolean isDisplayableInList() {
				return attributeDTO.isDisplayableInList();
			}

			@Override
			public boolean isMandatory() {
				return attributeDTO.isMandatory();
			}

			@Override
			public boolean isUnique() {
				return attributeDTO.isUnique();
			}

			@Override
			public boolean isActive() {
				return attributeDTO.isActive();
			}

			@Override
			public Mode getMode() {
				return attributeDTO.getMode();
			}

		};
	}

	private CMAttributeDefinition definitionForExisting(final AttributeDTO attributeDTO,
			final CMAttribute existingAttribute) {
		return new CMAttributeDefinition() {

			@Override
			public String getName() {
				return existingAttribute.getName();
			}

			@Override
			public CMEntryType getOwner() {
				return existingAttribute.getOwner();
			}

			@Override
			public CMAttributeType<?> getType() {
				return existingAttribute.getType();
			}

			@Override
			public String getDescription() {
				return attributeDTO.getDescription();
			}

			@Override
			public String getDefaultValue() {
				// TODO
				return null;
			}

			@Override
			public boolean isDisplayableInList() {
				return attributeDTO.isDisplayableInList();
			}

			@Override
			public boolean isMandatory() {
				return attributeDTO.isMandatory();
			}

			@Override
			public boolean isUnique() {
				return attributeDTO.isUnique();
			}

			@Override
			public boolean isActive() {
				return attributeDTO.isActive();
			}

			@Override
			public Mode getMode() {
				return attributeDTO.getMode();
			}

		};
	}

	private CMClassDefinition unactive(final CMClass existingClass) {
		return new CMClassDefinition() {

			@Override
			public Long getId() {
				return existingClass.getId();
			}

			@Override
			public String getName() {
				return existingClass.getName();
			}

			@Override
			public String getDescription() {
				return existingClass.getDescription();
			}

			@Override
			public CMClass getParent() {
				return existingClass.getParent();
			}

			@Override
			public boolean isSuperClass() {
				return existingClass.isSuperclass();
			}

			@Override
			public boolean isHoldingHistory() {
				return existingClass.holdsHistory();
			}

			@Override
			public boolean isActive() {
				return false;
			}

		};
	}

	private CMAttributeDefinition unactive(final CMAttribute existingAttribute) {
		return new CMAttributeDefinition() {

			@Override
			public String getName() {
				return existingAttribute.getName();
			}

			@Override
			public CMEntryType getOwner() {
				return existingAttribute.getOwner();
			}

			@Override
			public CMAttributeType<?> getType() {
				return existingAttribute.getType();
			}

			@Override
			public String getDescription() {
				return existingAttribute.getDescription();
			}

			@Override
			public String getDefaultValue() {
				// TODO
				return null;
			}

			@Override
			public boolean isDisplayableInList() {
				return existingAttribute.isDisplayableInList();
			}

			@Override
			public boolean isMandatory() {
				return existingAttribute.isMandatory();
			}

			@Override
			public boolean isUnique() {
				return existingAttribute.isUnique();
			}

			@Override
			public boolean isActive() {
				return false;
			}

			@Override
			public Mode getMode() {
				return existingAttribute.getMode();
			}

		};
	}

}
