package integration.rest;

import static java.util.Arrays.asList;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static org.apache.commons.lang3.CharEncoding.UTF_8;
import static org.cmdbuild.service.rest.model.Models.newResponseSingle;
import static org.cmdbuild.service.rest.model.Models.newSession;
import static org.cmdbuild.service.rest.test.ServerResource.randomPort;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.DeleteMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.PutMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.cmdbuild.service.rest.Sessions;
import org.cmdbuild.service.rest.model.ResponseSingle;
import org.cmdbuild.service.rest.model.Session;
import org.cmdbuild.service.rest.test.JsonSupport;
import org.cmdbuild.service.rest.test.ServerResource;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

public class SessionsTest {

	private Sessions service;

	@Rule
	public ServerResource server = ServerResource.newInstance() //
			.withServiceClass(Sessions.class) //
			.withService(service = mock(Sessions.class)) //
			.withPort(randomPort()) //
			.build();

	@ClassRule
	public static JsonSupport json = new JsonSupport();

	private HttpClient httpclient;

	@Before
	public void createHttpClient() throws Exception {
		httpclient = new HttpClient();
	}

	@Test
	public void created() throws Exception {
		// given
		final ResponseSingle<Session> sentResponse = newResponseSingle(Session.class) //
				.withElement(newSession() //
						.withId("token") //
						.withUsername("username") //
						.withPassword("password") //
						.withRole("role") //
						.withAvailableRoles(asList("foo", "bar", "baz")) //
						.build()) //
				.build();
		doReturn(sentResponse) //
				.when(service).create(any(Session.class));

		// when
		final PostMethod post = new PostMethod(server.resource("sessions/"));
		post.setRequestEntity(new StringRequestEntity( //
				"{\"username\" : \"foo\", \"password\" : \"bar\"}", //
				APPLICATION_JSON, //
				UTF_8) //
		);
		final int result = httpclient.executeMethod(post);

		// then
		final ArgumentCaptor<Session> captor = ArgumentCaptor.forClass(Session.class);
		verify(service).create(captor.capture());

		final Session captured = captor.getValue();
		assertThat(captured.getUsername(), equalTo("foo"));
		assertThat(captured.getPassword(), equalTo("bar"));

		assertThat(result, equalTo(200));
		assertThat(json.from(post.getResponseBodyAsString()), equalTo(json.from(sentResponse)));
	}

	@Test
	public void readed() throws Exception {
		// given
		final ResponseSingle<Session> sentResponse = newResponseSingle(Session.class) //
				.withElement(newSession() //
						.withId("the id") //
						.withUsername("the username") //
						.withPassword("the password") //
						.withRole("the role") //
						.withAvailableRoles(asList("foo", "bar", "baz")) //
						.build() //
				) //
				.build();
		doReturn(sentResponse) //
				.when(service).read(anyString());

		// when
		final GetMethod get = new GetMethod(server.resource("sessions/foo/"));
		final int result = httpclient.executeMethod(get);

		// then
		verify(service).read(eq("foo"));
		assertThat(result, equalTo(200));
		assertThat(json.from(get.getResponseBodyAsString()), equalTo(json.from(sentResponse)));
	}

	@Test
	public void updated() throws Exception {
		// given
		final ResponseSingle<Session> sentResponse = newResponseSingle(Session.class) //
				.withElement(newSession() //
						.withId("token") //
						.withUsername("username") //
						.withPassword("password") //
						.withRole("role") //
						.withAvailableRoles(asList("foo", "bar", "baz")) //
						.build()) //
				.build();
		doReturn(sentResponse) //
				.when(service).update(anyString(), any(Session.class));

		// when
		final PutMethod put = new PutMethod(server.resource("sessions/foo/"));
		put.setRequestEntity(new StringRequestEntity( //
				"{\"_id\" : \"ignored\", \"username\" : \"bar\", \"password\" : null, \"role\" : \"baz\"}", //
				APPLICATION_JSON, //
				UTF_8) //
		);
		final int result = httpclient.executeMethod(put);

		// then
		final ArgumentCaptor<Session> captor = ArgumentCaptor.forClass(Session.class);
		verify(service).update(eq("foo"), captor.capture());

		final Session captured = captor.getValue();
		assertThat(captured.getUsername(), equalTo("bar"));
		assertThat(captured.getRole(), equalTo("baz"));

		assertThat(result, equalTo(200));
		assertThat(json.from(put.getResponseBodyAsString()), equalTo(json.from(sentResponse)));
	}

	@Test
	public void deleted() throws Exception {
		// when
		final DeleteMethod delete = new DeleteMethod(server.resource("sessions/foo/"));
		final int result = httpclient.executeMethod(delete);

		// then
		verify(service).delete(eq("foo"));
		assertThat(result, equalTo(204));
	}

}
