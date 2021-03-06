package org.cmdbuild.service.rest.v2.model;

import static org.cmdbuild.service.rest.v2.constants.Serialization.ACCOUNT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.BCC;
import static org.cmdbuild.service.rest.v2.constants.Serialization.BODY;
import static org.cmdbuild.service.rest.v2.constants.Serialization.CC;
import static org.cmdbuild.service.rest.v2.constants.Serialization.DATE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.DELAY;
import static org.cmdbuild.service.rest.v2.constants.Serialization.FROM;
import static org.cmdbuild.service.rest.v2.constants.Serialization.KEEP_SYNCHRONIZATION;
import static org.cmdbuild.service.rest.v2.constants.Serialization.NOTIFY_WITH;
import static org.cmdbuild.service.rest.v2.constants.Serialization.NO_SUBJECT_PREFIX;
import static org.cmdbuild.service.rest.v2.constants.Serialization.PROMPT_SYNCHRONIZATION;
import static org.cmdbuild.service.rest.v2.constants.Serialization.STATUS;
import static org.cmdbuild.service.rest.v2.constants.Serialization.SUBJECT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.TEMPLATE;
import static org.cmdbuild.service.rest.v2.constants.Serialization.TO;
import static org.cmdbuild.service.rest.v2.constants.Serialization.UNDERSCORED_ID;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.codehaus.jackson.annotate.JsonProperty;

@XmlRootElement
public class Email extends AbstractModel {

	private Long id;
	private String from;
	private String to;
	private String cc;
	private String bcc;
	private String subject;
	private String body;
	private String date;
	private String status;
	private String notifyWith;
	private boolean noSubjectPrefix;
	private String account;
	private String template;
	private boolean keepSynchronization;
	private boolean promptSynchronization;
	private long delay;

	Email() {
		// package visibility
	}

	@XmlAttribute(name = UNDERSCORED_ID)
	@JsonProperty(UNDERSCORED_ID)
	public Long getId() {
		return id;
	}

	void setId(final Long id) {
		this.id = id;
	}

	@XmlAttribute(name = FROM)
	public String getFrom() {
		return from;
	}

	void setFrom(final String from) {
		this.from = from;
	}

	@XmlAttribute(name = TO)
	public String getTo() {
		return to;
	}

	void setTo(final String to) {
		this.to = to;
	}

	@XmlAttribute(name = CC)
	public String getCc() {
		return cc;
	}

	void setCc(final String cc) {
		this.cc = cc;
	}

	@XmlAttribute(name = BCC)
	public String getBcc() {
		return bcc;
	}

	void setBcc(final String bcc) {
		this.bcc = bcc;
	}

	@XmlAttribute(name = SUBJECT)
	public String getSubject() {
		return subject;
	}

	void setSubject(final String subject) {
		this.subject = subject;
	}

	@XmlAttribute(name = BODY)
	public String getBody() {
		return body;
	}

	void setBody(final String body) {
		this.body = body;
	}

	@XmlAttribute(name = DATE)
	public String getDate() {
		return date;
	}

	void setDate(final String date) {
		this.date = date;
	}

	@XmlAttribute(name = STATUS)
	public String getStatus() {
		return status;
	}

	void setStatus(final String status) {
		this.status = status;
	}

	@XmlAttribute(name = NOTIFY_WITH)
	public String getNotifyWith() {
		return notifyWith;
	}

	void setNotifyWith(final String notifyWith) {
		this.notifyWith = notifyWith;
	}

	@XmlAttribute(name = NO_SUBJECT_PREFIX)
	public boolean isNoSubjectPrefix() {
		return noSubjectPrefix;
	}

	void setNoSubjectPrefix(final boolean noSubjectPrefix) {
		this.noSubjectPrefix = noSubjectPrefix;
	}

	@XmlAttribute(name = ACCOUNT)
	public String getAccount() {
		return account;
	}

	void setAccount(final String account) {
		this.account = account;
	}

	@XmlAttribute(name = TEMPLATE)
	public String getTemplate() {
		return template;
	}

	void setTemplate(final String template) {
		this.template = template;
	}

	@XmlAttribute(name = KEEP_SYNCHRONIZATION)
	public boolean isKeepSynchronization() {
		return keepSynchronization;
	}

	void setKeepSynchronization(final boolean keepSynchronization) {
		this.keepSynchronization = keepSynchronization;
	}

	@XmlAttribute(name = PROMPT_SYNCHRONIZATION)
	public boolean isPromptSynchronization() {
		return promptSynchronization;
	}

	void setPromptSynchronization(final boolean promptSynchronization) {
		this.promptSynchronization = promptSynchronization;
	}

	@XmlAttribute(name = DELAY)
	public long getDelay() {
		return delay;
	}

	void setDelay(final long delay) {
		this.delay = delay;
	}

	@Override
	protected boolean doEquals(final Object obj) {
		if (obj == this) {
			return true;
		}
		if (!(obj instanceof Email)) {
			return false;
		}
		final Email other = Email.class.cast(obj);
		return new EqualsBuilder() //
				.append(this.id, other.id) //
				.append(this.from, other.from) //
				.append(this.to, other.to) //
				.append(this.cc, other.cc) //
				.append(this.bcc, other.bcc) //
				.append(this.subject, other.subject) //
				.append(this.body, other.body) //
				.append(this.notifyWith, other.notifyWith) //
				.append(this.date, other.date) //
				.append(this.status, other.status) //
				.append(this.noSubjectPrefix, other.noSubjectPrefix) //
				.append(this.account, other.account) //
				.append(this.template, other.template) //
				.append(this.keepSynchronization, other.keepSynchronization) //
				.append(this.promptSynchronization, other.promptSynchronization) //
				.append(this.delay, other.delay) //
				.isEquals();
	}

	@Override
	protected int doHashCode() {
		return new HashCodeBuilder() //
				.append(id) //
				.append(from) //
				.append(to) //
				.append(cc) //
				.append(bcc) //
				.append(subject) //
				.append(body) //
				.append(notifyWith) //
				.append(date) //
				.append(status) //
				.append(noSubjectPrefix) //
				.append(account) //
				.append(template) //
				.append(keepSynchronization) //
				.append(promptSynchronization) //
				.append(delay) //
				.toHashCode();
	}

}
