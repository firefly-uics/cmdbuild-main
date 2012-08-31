package org.cmdbuild.workflow.widget;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import org.cmdbuild.logic.EmailLogic;
import org.cmdbuild.model.widget.ManageEmail;
import org.cmdbuild.model.widget.ManageEmail.EmailTemplate;
import org.cmdbuild.model.widget.Widget;
import org.cmdbuild.services.TemplateRepository;

public class ManageEmailWidgetFactory extends ValuePairWidgetFactory {

	private final static String TO_ADDRESSES = "ToAddresses";
	private final static String CC_ADDRESSES = "CCAddresses";
	private final static String SUBJECT = "Subject";
	private final static String CONTENT = "Content";
	private final static String CONDITION = "Condition";
	private final static String READ_ONLY = "ReadOnly";

	private final static String WIDGET_NAME = "manageEmail";

	private final EmailLogic emailLogic;

	public ManageEmailWidgetFactory(final TemplateRepository templateRespository, final EmailLogic emailLogic) {
		super(templateRespository);
		this.emailLogic = emailLogic;
	}

	@Override
	public String getWidgetName() {
		return WIDGET_NAME;
	}

	/*
	 * naive but fast to write solution ...first do it works...
	 */
	@Override
	protected Widget createWidget(final Map<String, Object> valueMap) {
		final ManageEmail widget = new ManageEmail(emailLogic);
		final Map<String, EmailTemplate> emailTemplate = new LinkedHashMap<String, EmailTemplate>(); // I
																										// want
																										// preserve
																										// the
																										// order
		final Set<String> managedParameters = new HashSet<String>();
		managedParameters.add(READ_ONLY);
		managedParameters.add(BUTTON_LABEL);

		final Map<String, String> toAddresses = getAttributesStartingWith(valueMap, TO_ADDRESSES);
		for (final String key : toAddresses.keySet()) {
			final EmailTemplate t = getTemplateForKey(key, emailTemplate, TO_ADDRESSES);
			t.setToAddresses(readString(valueMap.get(key)));
		}
		managedParameters.addAll(toAddresses.keySet());

		final Map<String, String> ccAddresses = getAttributesStartingWith(valueMap, CC_ADDRESSES);
		for (final String key : ccAddresses.keySet()) {
			final EmailTemplate t = getTemplateForKey(key, emailTemplate, CC_ADDRESSES);
			t.setCcAddresses(readString(valueMap.get(key)));
		}
		managedParameters.addAll(ccAddresses.keySet());

		final Map<String, String> subjects = getAttributesStartingWith(valueMap, SUBJECT);
		for (final String key : subjects.keySet()) {
			final EmailTemplate t = getTemplateForKey(key, emailTemplate, SUBJECT);
			t.setSubject(readString(valueMap.get(key)));
		}
		managedParameters.addAll(subjects.keySet());

		final Map<String, String> contents = getAttributesStartingWith(valueMap, CONTENT);
		for (final String key : contents.keySet()) {
			final EmailTemplate t = getTemplateForKey(key, emailTemplate, CONTENT);
			t.setContent(readString(valueMap.get(key)));
		}
		managedParameters.addAll(contents.keySet());

		final Map<String, String> conditions = getAttributesStartingWith(valueMap, CONDITION);
		for (final String key : conditions.keySet()) {
			final EmailTemplate t = getTemplateForKey(key, emailTemplate, CONDITION);
			t.setCondition(readString(valueMap.get(key)));
		}
		managedParameters.addAll(conditions.keySet());

		widget.setEmailTemplates(emailTemplate.values());
		widget.setTemplates(extractUnmanagedStringParameters(valueMap, managedParameters));
		widget.setReadOnly(readBooleanTrueIfPresent(valueMap.get(READ_ONLY)));

		return widget;
	}

	private Map<String, String> getAttributesStartingWith(final Map<String, Object> valueMap, final String prefix) {
		final Map<String, String> out = new HashMap<String, String>();

		for (final String key : valueMap.keySet()) {
			if (key.startsWith(prefix)) {
				out.put(key, readString(valueMap.get(key)));
			}
		}

		return out;
	}

	private EmailTemplate getTemplateForKey(final String key, final Map<String, EmailTemplate> templates,
			final String attributeName) {
		String postFix = key.replaceFirst(attributeName, "");
		if ("".equals(postFix)) {
			postFix = "implicitTemplateName";
		}

		if (templates.containsKey(postFix)) {
			return templates.get(postFix);
		} else {
			final EmailTemplate t = new EmailTemplate();
			templates.put(postFix, t);
			return t;
		}
	}
}