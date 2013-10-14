package org.cmdbuild.servlets.json.management;

import org.cmdbuild.servlets.json.JSONBaseWithSpringContext;
import org.cmdbuild.servlets.json.serializers.JsonWorkflowDTOs.JsonEmail;
import org.cmdbuild.servlets.utils.Parameter;

import com.google.common.base.Function;
import com.google.common.collect.Iterators;

public class Email extends JSONBaseWithSpringContext {

	@JSONExported
	public JsonResponse getEmailList(@Parameter("ProcessId") final Long processCardId) {
		final Iterable<org.cmdbuild.model.email.Email> emails = emailLogic().getEmails(processCardId);
		return JsonResponse.success(Iterators.transform(emails.iterator(),
				new Function<org.cmdbuild.model.email.Email, JsonEmail>() {
					@Override
					public JsonEmail apply(final org.cmdbuild.model.email.Email input) {
						return new JsonEmail(input);
					}
				}));
	}

};
