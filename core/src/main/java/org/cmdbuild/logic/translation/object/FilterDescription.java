package org.cmdbuild.logic.translation.object;

import java.util.Map;

import org.cmdbuild.logic.translation.BaseTranslation;
import org.cmdbuild.logic.translation.TranslationObjectVisitor;

public class FilterDescription extends BaseTranslation {

	private FilterDescription(final Builder builder) {
		this.setName(builder.name);
		this.setTranslations(builder.translations);
	}

	public static Builder newInstance() {
		return new Builder();
	}

	@Override
	public void accept(final TranslationObjectVisitor visitor) {
		visitor.visit(this);
	}

	public static class Builder implements org.apache.commons.lang3.builder.Builder<FilterDescription> {

		private String name;
		private Map<String, String> translations;

		private Builder() {
		}

		@Override
		public FilterDescription build() {
			return new FilterDescription(this);
		}

		public Builder withName(final String name) {
			this.name = name;
			return this;
		}

		public Builder withTranslations(final Map<String, String> translations) {
			this.translations = translations;
			return this;
		}

	}

}
