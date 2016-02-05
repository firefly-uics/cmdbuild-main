package org.cmdbuild.service.rest.v2.model;

import static org.cmdbuild.service.rest.v2.constants.Serialization.ACTIVE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.DATA;
import static org.cmdbuild.service.rest.v2.constants.Serialization.LABEL;
import static org.cmdbuild.service.rest.v2.constants.Serialization.OUTPUT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.REQUIRED;
import static org.cmdbuild.service.rest.v2.constants.Serialization.TYPE;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@XmlRootElement
public class Widget extends ModelWithStringId {

	private String type;
	private boolean active;
	private boolean required;
	private String label;
	private Values data;
	private Object output;

	Widget() {
		// package visibility
	}

	@XmlElement(name = TYPE)
	public String getType() {
		return type;
	}

	void setType(final String type) {
		this.type = type;
	}

	@XmlElement(name = ACTIVE)
	public boolean isActive() {
		return active;
	}

	void setActive(final boolean active) {
		this.active = active;
	}

	@XmlElement(name = REQUIRED)
	public boolean isRequired() {
		return required;
	}

	void setRequired(final boolean required) {
		this.required = required;
	}

	@XmlElement(name = LABEL)
	public String getLabel() {
		return label;
	}

	void setLabel(final String label) {
		this.label = label;
	}

	@XmlElement(name = DATA)
	public Values getData() {
		return data;
	}

	void setData(final Values data) {
		this.data = data;
	}

	@XmlElement(name = OUTPUT)
	public Object getOutput() {
		return output;
	}

	void setOutput(final Object output) {
		this.output = output;
	}

	@Override
	protected boolean doEquals(final Object obj) {
		if (this == obj) {
			return true;
		}

		if (!(obj instanceof Widget)) {
			return false;
		}

		final Widget other = Widget.class.cast(obj);
		return new EqualsBuilder() //
				.append(this.getId(), other.getId()) //
				.append(this.type, other.type) //
				.append(this.active, other.active) //
				.append(this.required, other.required) //
				.append(this.label, other.label) //
				.append(this.data, other.data) //
				.append(this.output, other.output) //
				.isEquals();
	}

	@Override
	protected int doHashCode() {
		return new HashCodeBuilder() //
				.append(this.getId()) //
				.append(this.type) //
				.append(this.active) //
				.append(this.required) //
				.append(this.label) //
				.append(this.data) //
				.append(this.output) //
				.toHashCode();
	}

}
