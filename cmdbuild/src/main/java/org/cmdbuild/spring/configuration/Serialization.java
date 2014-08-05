package org.cmdbuild.spring.configuration;

import static org.cmdbuild.spring.util.Constants.PROTOTYPE;

import org.cmdbuild.auth.LanguageStore;
import org.cmdbuild.auth.UserStore;
import org.cmdbuild.data.store.lookup.LookupStore;
import org.cmdbuild.servlets.json.serializers.CardSerializer;
import org.cmdbuild.servlets.json.serializers.ClassSerializer;
import org.cmdbuild.servlets.json.serializers.DefaultTranslationFacade;
import org.cmdbuild.servlets.json.serializers.DomainSerializer;
import org.cmdbuild.servlets.json.serializers.RelationAttributeSerializer;
import org.cmdbuild.servlets.json.serializers.TranslationFacade;
import org.cmdbuild.spring.annotations.ConfigurationComponent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;

@ConfigurationComponent
public class Serialization {

	@Autowired
	private Data data;

	@Autowired
	private LanguageStore languageStore;
	
	@Autowired
	private LookupStore lookupStore;

	@Autowired
	private PrivilegeManagement privilegeManagement;

	@Autowired
	private Translation translation;

	@Autowired
	private UserStore userStore;

	@Autowired
	private Workflow workflow;

	@Bean
	public CardSerializer cardSerializer() {
		return new CardSerializer(data.systemDataAccessLogicBuilder(), relationAttributeSerializer(),
				translationFacade(),lookupStore);
	}

	@Bean
	public TranslationFacade translationFacade() {
		return new DefaultTranslationFacade(languageStore, translation.translationLogic());
	}

	@Bean
	@Scope(PROTOTYPE)
	public ClassSerializer classSerializer() {
		return new ClassSerializer( //
				data.systemDataView(), //
				workflow.systemWorkflowLogicBuilder(), //
				privilegeManagement.userPrivilegeContext(), //
				translationFacade(), //
				data.securityLogic(), //
				userStore //
		);
	}

	@Bean
	@Scope(PROTOTYPE)
	public DomainSerializer domainSerializer() {
		return new DomainSerializer( //
				data.systemDataView(), //
				privilegeManagement.userPrivilegeContext(), translationFacade());
	}

	@Bean
	public RelationAttributeSerializer relationAttributeSerializer() {
		return new RelationAttributeSerializer(data.lookupStore());
	}

}