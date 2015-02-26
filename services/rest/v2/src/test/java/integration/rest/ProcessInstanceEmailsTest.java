package integration.rest;

import static java.util.Arrays.asList;
import static org.apache.http.entity.ContentType.APPLICATION_JSON;
import static org.cmdbuild.service.rest.test.HttpClientUtils.contentOf;
import static org.cmdbuild.service.rest.test.HttpClientUtils.statusCodeOf;
import static org.cmdbuild.service.rest.test.ServerResource.randomPort;
import static org.cmdbuild.service.rest.v2.constants.Serialization.FILTER;
import static org.cmdbuild.service.rest.v2.constants.Serialization.LIMIT;
import static org.cmdbuild.service.rest.v2.constants.Serialization.START;
import static org.cmdbuild.service.rest.v2.model.Models.newEmail;
import static org.cmdbuild.service.rest.v2.model.Models.newMetadata;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseMultiple;
import static org.cmdbuild.service.rest.v2.model.Models.newResponseSingle;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyLong;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.cmdbuild.service.rest.test.JsonSupport;
import org.cmdbuild.service.rest.test.ServerResource;
import org.cmdbuild.service.rest.v2.ProcessInstanceEmails;
import org.cmdbuild.service.rest.v2.model.Email;
import org.cmdbuild.service.rest.v2.model.ResponseMultiple;
import org.cmdbuild.service.rest.v2.model.ResponseSingle;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;

public class ProcessInstanceEmailsTest {

	private ProcessInstanceEmails service;

	@Rule
	public ServerResource server = ServerResource.newInstance() //
			.withServiceClass(ProcessInstanceEmails.class) //
			.withService(service = mock(ProcessInstanceEmails.class)) //
			.withPort(randomPort()) //
			.build();

	@ClassRule
	public static JsonSupport json = new JsonSupport();

	private HttpClient httpclient;

	@Before
	public void createHttpClient() throws Exception {
		httpclient = HttpClientBuilder.create().build();
	}

	@Test
	public void emailCreated() throws Exception {
		// given
		final ResponseSingle<Long> expectedResponse = newResponseSingle(Long.class) //
				.withElement(42L) //
				.build();
		doReturn(expectedResponse) //
				.when(service).create(anyString(), anyLong(), any(Email.class));

		// when
		final HttpPost post = new HttpPost(server.resource("processes/dummy/instances/12/emails/"));
		post.setEntity(new StringEntity("" //
				+ "{" //
				+ "    \"from\" : \"from@example.com\"," //
				+ "    \"to\" : [\"to@example.com\"]," //
				+ "    \"cc\" : [\"cc@example.com\", \"another_cc@example.com\"]," //
				+ "    \"bcc\" : [\"bcc@example.com\"]," //
				+ "    \"subject\" : \"subject\"," //
				+ "    \"body\" : \"body\"," //
				+ "    \"status\" : \"draft\"," //
				+ "    \"notifyWith\" : \"foo\"," //
				+ "    \"noSubjectPrefix\" : false," //
				+ "    \"account\" : \"bar\"," //
				+ "    \"temporary\" : false," //
				+ "    \"template\" : \"baz\"," //
				+ "    \"keepSynchronization\" : true," //
				+ "    \"promptSynchronization\" : true" //
				+ "}", //
				APPLICATION_JSON) //
		);
		final HttpResponse response = httpclient.execute(post);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		verify(service).create(eq("dummy"), eq(12L), eq(newEmail() //
				.withFrom("from@example.com") //
				.withTo(asList("to@example.com")) //
				.withCc(asList("cc@example.com", "another_cc@example.com")) //
				.withBcc(asList("bcc@example.com")) //
				.withSubject("subject") //
				.withBody("body") //
				.withStatus("draft") //
				.withNotifyWith("foo") //
				.withNoSubjectPrefix(false) //
				.withAccount("bar") //
				.withTemporary(false) //
				.withTemplate("baz") //
				.withKeepSynchronization(true) //
				.withPromptSynchronization(true) //
				.build()));
	}

	@Test
	public void emailsRead() throws Exception {
		// given
		final ResponseMultiple<Long> expectedResponse = newResponseMultiple(Long.class) //
				.withElements(asList(1L, 2L)) //
				.withMetadata(newMetadata() //
						.withTotal(4L) //
						.build()) //
				.build();
		when(service.readAll(anyString(), anyLong(), anyInt(), anyInt())) //
				.thenReturn(expectedResponse);

		// when
		final HttpGet get = new HttpGet(new URIBuilder(server.resource("processes/dummy/instances/12/emails/")) //
				.setParameter(FILTER, "filter") //
				.setParameter(LIMIT, "34") //
				.setParameter(START, "56") //
				.build());
		final HttpResponse response = httpclient.execute(get);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		verify(service).readAll(eq("dummy"), eq(12L), eq(34), eq(56));
	}

	@Test
	public void emailRead() throws Exception {
		// given
		final ResponseSingle<Email> expectedResponse = newResponseSingle(Email.class) //
				.withElement(newEmail() //
						.withId(42L) //
						.build()) //
				.build();
		when(service.read(anyString(), anyLong(), anyLong())) //
				.thenReturn(expectedResponse);

		// when
		final HttpGet get = new HttpGet(server.resource("processes/dummy/instances/12/emails/34/"));
		final HttpResponse response = httpclient.execute(get);

		// then
		assertThat(statusCodeOf(response), equalTo(200));
		assertThat(json.from(contentOf(response)), equalTo(json.from(expectedResponse)));

		verify(service).read(eq("dummy"), eq(12L), eq(34L));
	}

	@Test
	public void emailUpdated() throws Exception {
		// when
		final HttpPut put = new HttpPut(server.resource("processes/dummy/instances/12/emails/34/"));
		put.setEntity(new StringEntity("" //
				+ "{" //
				+ "    \"from\" : \"from@example.com\"," //
				+ "    \"to\" : [\"to@example.com\"]," //
				+ "    \"cc\" : [\"cc@example.com\", \"another_cc@example.com\"]," //
				+ "    \"bcc\" : [\"bcc@example.com\"]," //
				+ "    \"subject\" : \"subject\"," //
				+ "    \"body\" : \"body\"," //
				+ "    \"status\" : \"draft\"," //
				+ "    \"notifyWith\" : \"foo\"," //
				+ "    \"noSubjectPrefix\" : false," //
				+ "    \"account\" : \"bar\"," //
				+ "    \"temporary\" : false," //
				+ "    \"template\" : \"baz\"," //
				+ "    \"keepSynchronization\" : true," //
				+ "    \"promptSynchronization\" : true" //
				+ "}", //
				APPLICATION_JSON) //
		);
		final HttpResponse response = httpclient.execute(put);

		// then
		assertThat(statusCodeOf(response), equalTo(204));

		verify(service).update(eq("dummy"), eq(12L), eq(34L), eq(newEmail() //
				.withFrom("from@example.com") //
				.withTo(asList("to@example.com")) //
				.withCc(asList("cc@example.com", "another_cc@example.com")) //
				.withBcc(asList("bcc@example.com")) //
				.withSubject("subject") //
				.withBody("body") //
				.withStatus("draft") //
				.withNotifyWith("foo") //
				.withNoSubjectPrefix(false) //
				.withAccount("bar") //
				.withTemporary(false) //
				.withTemplate("baz") //
				.withKeepSynchronization(true) //
				.withPromptSynchronization(true) //
				.build()));
	}

	@Test
	public void emailDeleted() throws Exception {
		// when
		final HttpDelete delete = new HttpDelete(server.resource("processes/dummy/instances/12/emails/34/"));
		final HttpResponse response = httpclient.execute(delete);

		// then
		assertThat(statusCodeOf(response), equalTo(204));

		verify(service).delete(eq("dummy"), eq(12L), eq(34L));
	}

}
