package org.cmdbuild.data.store.lookup;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.cmdbuild.data.store.Storable;
import org.cmdbuild.data.store.lookup.LookupType.LookupTypeBuilder;

public final class Lookup implements Storable {

	public static class LookupBuilder implements org.apache.commons.lang3.builder.Builder<Lookup> {

		private Long id;
		private String code;
		private String description;
		private String notes;
		private LookupType type;
		private Integer number = 0;
		private boolean active;
		private boolean isDefault;
		private Long parentId;
		private Lookup parent;
		private String translationUuid;

		/**
		 * instantiate using {@link Lookup#newInstance()}
		 */
		private LookupBuilder() {
		}

		public Lookup.LookupBuilder clone(final Lookup lookup) {
			this.id = lookup.id;
			this.code = lookup.code;
			this.description = lookup.description;
			this.notes = lookup.notes;
			this.type = lookup.type;
			this.number = lookup.number;
			this.active = lookup.active;
			this.isDefault = lookup.isDefault;
			this.parentId = lookup.parentId;
			this.parent = lookup.parent;
			this.translationUuid = lookup.translationUuid;
			return this;
		}

		public Lookup.LookupBuilder withId(final Long value) {
			this.id = value;
			return this;
		}

		public Lookup.LookupBuilder withCode(final String value) {
			this.code = value;
			return this;
		}

		public Lookup.LookupBuilder withDescription(final String value) {
			this.description = value;
			return this;
		}

		public LookupBuilder withNotes(final String value) {
			this.notes = value;
			return this;
		}

		public Lookup.LookupBuilder withType(final LookupTypeBuilder builder) {
			return withType(builder.build());
		}

		public Lookup.LookupBuilder withType(final LookupType value) {
			this.type = value;
			return this;
		}

		public Lookup.LookupBuilder withType(final org.apache.commons.lang3.builder.Builder<LookupType> value) {
			this.type = value.build();
			return this;
		}

		public Lookup.LookupBuilder withNumber(final Integer value) {
			this.number = value;
			return this;
		}

		public Lookup.LookupBuilder withActiveStatus(final boolean value) {
			this.active = value;
			return this;
		}

		public Lookup.LookupBuilder withDefaultStatus(final boolean value) {
			this.isDefault = value;
			return this;
		}

		public Lookup.LookupBuilder withParentId(final Long value) {
			this.parentId = value;
			return this;
		}

		public Lookup.LookupBuilder withParent(final Lookup value) {
			this.parentId = value.id;
			this.parent = value;
			return this;
		}

		public Lookup.LookupBuilder withUuid(final String translationUuid) {
			this.translationUuid = translationUuid;
			return this;
		}

		@Override
		public Lookup build() {
			return new Lookup(this);
		}

	}

	public static Lookup.LookupBuilder newInstance() {
		return new LookupBuilder();
	}

	private Long id;
	public final String code;
	public final String description;
	public final String notes;
	public final LookupType type;
	public final Integer number;
	public final boolean active;
	public final boolean isDefault;
	public final Long parentId;
	public final Lookup parent;
	public String translationUuid;

	private final transient String toString;

	private Lookup(final LookupBuilder builder) {
		this.id = builder.id;
		this.code = builder.code;
		this.description = builder.description;
		this.notes = builder.notes;
		this.type = builder.type;
		this.number = builder.number;
		this.active = builder.active;
		this.isDefault = builder.isDefault;
		this.parentId = builder.parentId;
		this.parent = builder.parent;
		this.translationUuid = builder.translationUuid;
		this.toString = ToStringBuilder.reflectionToString(this, ToStringStyle.SIMPLE_STYLE);
	}

	@Override
	public String getIdentifier() {
		return id.toString();
	}
	
	public String getTranslationUuid() {
		return translationUuid;
	}

	@Override
	public String toString() {
		return toString;
	}

	public Long getId() {
		return id;
	}

	public void setId(final Long id) {
		this.id = id;
	}

	// FIXME Do I really need it?
	public String getDescription() {
		return description;
	}
}
