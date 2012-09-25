package unit;

import static org.hamcrest.Matchers.hasItem;
import static org.junit.Assert.assertThat;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.cmdbuild.dms.DmsConfiguration;
import org.cmdbuild.dms.alfresco.utils.CustomModelParser;
import org.junit.Before;
import org.junit.Test;

import utils.TestConfiguration;

public class CustomModelParserTest {

	private CustomModelParser customModelParser;

	@Before
	public void createParser() throws Exception {
		final DmsConfiguration configuration = new TestConfiguration();
		final String content = configuration.getAlfrescoCustomModelFileContent();
		final String prefix = configuration.getAlfrescoCustomPrefix();
		customModelParser = new CustomModelParser(content, prefix);
	}

	@Test
	public void readAspectsByType() throws Exception {
		final Map<String, List<String>> aspectsByType = customModelParser.getAspectsByType();

		final Collection<String> types = aspectsByType.keySet();
		assertThat(types, hasItem("SuperType"));
		assertThat(types, hasItem("aType"));
		assertThat(types, hasItem("anotherType"));
		assertThat(types, hasItem("Document"));
		assertThat(types, hasItem("Image"));

		assertThat(aspectsByType.get("aType"), hasItem("foo"));
		assertThat(aspectsByType.get("aType"), hasItem("bar"));
		assertThat(aspectsByType.get("anotherType"), hasItem("baz"));
		assertThat(aspectsByType.get("Document"), hasItem("text"));
		assertThat(aspectsByType.get("Document"), hasItem("summary"));
		assertThat(aspectsByType.get("Image"), hasItem("size"));
	}

}
