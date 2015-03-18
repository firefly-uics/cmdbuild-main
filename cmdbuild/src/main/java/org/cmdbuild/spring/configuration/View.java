package org.cmdbuild.spring.configuration;

import static org.cmdbuild.spring.util.Constants.PROTOTYPE;

import org.cmdbuild.auth.UserStore;
import org.cmdbuild.data.store.dao.StorableConverter;
import org.cmdbuild.logic.view.ViewLogic;
import org.cmdbuild.model.ViewConverter;
import org.cmdbuild.services.localization.LocalizedStorableConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
public class View {

	@Autowired
	private Data data;

	@Autowired
	private UserStore userStore;
	
	@Autowired
	private Translation translation;

	private org.cmdbuild.model.ViewConverter baseViewConverter() {
		return new ViewConverter(data.systemDataView());
	}
	
	@Bean
	public StorableConverter<org.cmdbuild.model._View> viewConverter() {
		return new LocalizedStorableConverter<org.cmdbuild.model._View>(baseViewConverter(), translation.translationFacade(), data.systemDataView());
	}

	@Bean
	@Scope(PROTOTYPE)
	public ViewLogic viewLogic() {
		return new ViewLogic(data.systemDataView(), viewConverter(), userStore.getUser());
	}

}
