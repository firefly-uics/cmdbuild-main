package unit.workflow;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;

import org.cmdbuild.dao.entry.CMValueSet;
import org.cmdbuild.model.widget.ManageRelation;
import org.cmdbuild.workflow.widget.ManageRelationWidgetFactory;
import org.junit.Test;

public class ManageRelationWidgetFactoryTest {

	@Test
	public void testSource() {
		final ManageRelationWidgetFactory factory = new ManageRelationWidgetFactory();

		ManageRelation w = (ManageRelation) factory.createWidget(
			"IsDirect='true'\n",
			mock(CMValueSet.class)
		);
		assertThat(w.getSource(), is("_1"));

		w = (ManageRelation) factory.createWidget(
			"IsDirect='false'\n",
			mock(CMValueSet.class)
		);
		assertThat(w.getSource(), is("_2"));

		w = (ManageRelation) factory.createWidget(
			"IsDirect='asdf asd'\n",
			mock(CMValueSet.class)
		);
		assertThat(w.getSource(), is("_2"));

		w = (ManageRelation) factory.createWidget(
			"",
			mock(CMValueSet.class)
		);
		assertThat(w.getSource(), is(nullValue()));
	}

}
