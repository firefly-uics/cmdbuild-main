package org.cmdbuild.workflow.widget;

import static org.cmdbuild.dao.driver.postgres.Const.ID_ATTRIBUTE;
import static org.cmdbuild.dao.query.clause.AnyAttribute.anyAttribute;
import static org.cmdbuild.dao.query.clause.QueryAliasAttribute.attribute;
import static org.cmdbuild.dao.query.clause.where.EqualsOperatorAndValue.eq;
import static org.cmdbuild.dao.query.clause.where.SimpleWhereClause.condition;

import java.util.Map;

import org.apache.commons.lang.Validate;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.model.widget.CreateModifyCard;
import org.cmdbuild.model.widget.Widget;
import org.cmdbuild.services.TemplateRepository;

public class CreateModifyCardWidgetFactory extends ValuePairWidgetFactory {

	private static final String WIDGET_NAME = "createModifyCard";

	public static final String OBJ_REF = "Reference";
	public static final String CLASS_NAME = "ClassName";
	public static final String OBJ_ID = "ObjId";
	public static final String READONLY = "ReadOnly";

	private final CMDataView dataView;

	public CreateModifyCardWidgetFactory(final TemplateRepository templateRespository, final CMDataView dataView) {
		super(templateRespository);
		this.dataView = dataView;
	}

	@Override
	public String getWidgetName() {
		return WIDGET_NAME;
	}

	@Override
	protected Widget createWidget(final Map<String, Object> valueMap) {
		final CreateModifyCard widget = new CreateModifyCard();
		if (valueMap.containsKey(OBJ_REF)) {
			configureWidgetFromReference(widget, valueMap);
		} else {
			configureWidgetFromClassName(widget, valueMap);
		}
		widget.setReadonly(readBooleanTrueIfPresent(valueMap.get(READONLY)));
		widget.setOutputName(readString(valueMap.get(OUTPUT_KEY)));

		return widget;
	}

	private void configureWidgetFromClassName(final CreateModifyCard widget, final Map<String, Object> valueMap) {
		final String className = readString(valueMap.get(CLASS_NAME));
		final String cardIdOrCql = readString(valueMap.get(OBJ_ID));
		Validate.notEmpty(className, CLASS_NAME + " is required");

		widget.setTargetClass(className);
		widget.setIdcardcqlselector(cardIdOrCql);
	}

	private void configureWidgetFromReference(final CreateModifyCard widget, final Map<String, Object> valueMap) {
		final Long id = Long.class.cast(valueMap.get(OBJ_REF));

		// TODO improve performances
		final CMClass queryClass = dataView.findClass("Class");
		final CMCard card = dataView.select(anyAttribute(queryClass)) //
				.from(queryClass) //
				.where(condition(attribute(queryClass, ID_ATTRIBUTE), eq(id))) //
				.run() //
				.getOnlyRow() //
				.getCard(queryClass);

		widget.setTargetClass(card.getType().getName());
		widget.setIdcardcqlselector(card.getId().toString());
	}
}
