package org.cmdbuild.services.localization;

import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.data.store.Storable;
import org.cmdbuild.data.store.dao.ForwardingStorableConverter;
import org.cmdbuild.data.store.dao.StorableConverter;
import org.cmdbuild.data.store.lookup.Lookup;
import org.cmdbuild.logic.translation.TranslationFacade;

import com.google.common.base.Function;

public class LocalizedStorableConverter<T extends Storable> extends ForwardingStorableConverter<T> {

	private final StorableConverter<T> delegate;
	private final TranslationFacade facade;

	public LocalizedStorableConverter(final StorableConverter<T> delegate, final TranslationFacade facade) {
		this.delegate = delegate;
		this.facade = facade;
	}

	@Override
	protected StorableConverter<T> delegate() {
		return delegate;
	}

	@Override
	public T convert(CMCard card) {
		return proxy(super.convert(card));
	}

	private T proxy(T input) {
		final T output;
		if (input instanceof LocalizedStorable) {
			final LocalizedStorable localizedStorable = LocalizedStorable.class.cast(input);
			output = new LocalizedStorableVisitor() {

				private T output;

				public T proxy() {
					localizedStorable.accept(this);
					return output;
				}

				@Override
				public void visit(LocalizedLookup storable) {
					
					output = (T) storable;
//					output = new Function<Lookup, T>() {
//
//						@Override
//						public T apply(LocalizedLookup input) {
//							return  (T) ((input == null) ? null : new LocalizedLookup(input, facade));
//						}
//					}.apply(storable);
				}
			}.proxy();
		} else {
			output = input;
		}
		return output;
	}

}
