package org.cmdbuild.elements.proxy.iterator;

import java.util.Iterator;

public abstract class ProxyIterator<T> implements Iterator<T> {
	Iterator<T> i;
	T next;
	protected ProxyIterator(Iterator<T> i) {
		this.i = i;
		this.next = null;
	}
	private void fetchNext() {
		while (this.next == null && i.hasNext()) {
			T t = i.next();
			if (isValid(t))
				this.next = t;
		}
	}
	public T next() {
		fetchNext();
		T t = this.next;
		this.next = null;
		return createProxy(t);
	}
	public boolean hasNext() {
		this.fetchNext();
		return (this.next != null);
	}
	public void remove() {
		throw new UnsupportedOperationException();
	}
	protected abstract boolean isValid(T t);
	protected abstract T createProxy(T d);
}