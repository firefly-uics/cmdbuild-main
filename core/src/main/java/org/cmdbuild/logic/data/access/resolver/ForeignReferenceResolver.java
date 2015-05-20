package org.cmdbuild.logic.data.access.resolver;

import static com.google.common.collect.FluentIterable.from;

import java.util.Map;

import org.apache.commons.lang3.builder.Builder;
import org.cmdbuild.dao.entry.CMEntry;
import org.cmdbuild.dao.entrytype.CMAttribute;

import com.google.common.base.Function;
import com.google.common.collect.Maps;

public class ForeignReferenceResolver<T extends CMEntry> {

	public static abstract class EntryFiller<T extends CMEntry> {

		protected Map<String, Object> values = Maps.newHashMap();
		protected T input;

		public void setInput(final T input) {
			this.input = input;
			this.values = Maps.newHashMap();
		}

		public void setValue(final String name, final Object value) {
			values.put(name, value);
		}

		public abstract T getOutput();

	}

	public static class ForeignReferenceResolverBuilder<T extends CMEntry> implements
			Builder<ForeignReferenceResolver<T>> {

		private Iterable<? extends T> entries;
		public EntryFiller<T> entryFiller;
		public AbstractSerializer<T> serializer;

		@Override
		public ForeignReferenceResolver<T> build() {
			return new ForeignReferenceResolver<T>(this);
		}

		public ForeignReferenceResolverBuilder<T> withEntries(final Iterable<? extends T> value) {
			entries = value;
			return this;
		}

		public ForeignReferenceResolverBuilder<T> withEntryFiller(final EntryFiller<T> value) {
			entryFiller = value;
			return this;
		}

		public ForeignReferenceResolverBuilder<T> withSerializer(final AbstractSerializer<T> value) {
			serializer = value;
			return this;
		}

	}

	public static <T extends CMEntry> ForeignReferenceResolverBuilder<T> newInstance() {
		return new ForeignReferenceResolverBuilder<T>();
	}

	private final Iterable<? extends T> entries;
	private final EntryFiller<T> entryFiller;
	private final AbstractSerializer<T> serializer;

	public ForeignReferenceResolver(final ForeignReferenceResolverBuilder<T> builder) {
		this.entries = builder.entries;
		this.entryFiller = builder.entryFiller;
		this.serializer = builder.serializer;
	}

	public Iterable<T> resolve() {

		return from(entries) //
				.transform(new Function<T, T>() {

					@Override
					public T apply(final T input) {

						entryFiller.setInput(input);

						for (final CMAttribute attribute : input.getType().getAllAttributes()) {
							final String attributeName = attribute.getName();

							final Object rawValue;
							try {
								rawValue = input.get(attributeName);
							} catch (final Throwable e) {
								/*
								 * This could happen for ImportCSV because the
								 * fake card has no the whole attributes of the
								 * relative CMClass
								 */
								continue;
							}

							/**
							 * must be kept in the same order. If not, an
							 * attribute with null value will not be returned
							 */
							entryFiller.setValue(attributeName, rawValue);
							if (rawValue == null) {
								continue;
							}

							serializer.setRawValue(rawValue);
							serializer.setAttributeName(attributeName);
							serializer.setEntryFiller(entryFiller);
							attribute.getType().accept(serializer);

						}
						return entryFiller.getOutput();
					}

				});
	}

}
