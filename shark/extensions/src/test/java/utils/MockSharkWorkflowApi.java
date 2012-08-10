package utils;

import static org.mockito.Mockito.mock;

import org.cmdbuild.api.fluent.FluentApi;
import org.cmdbuild.api.fluent.FluentApiExecutor;
import org.cmdbuild.workflow.api.SchemaApi;
import org.cmdbuild.workflow.api.SharkWorkflowApi;
import org.cmdbuild.workflow.type.LookupType;

public class MockSharkWorkflowApi extends SharkWorkflowApi {

	public static final FluentApiExecutor fluentApiExecutor;

	static {
		fluentApiExecutor = mock(FluentApiExecutor.class);
	}

	@Override
	public FluentApi fluentApi() {
		return new FluentApi(fluentApiExecutor);
	}

	@Override
	public SchemaApi schemaApi() {
		return new SchemaApi() {

			@Override
			public ClassInfo findClass(final String className) {
				return null;
			}

			@Override
			public ClassInfo findClass(final int classId) {
				return null;
			}

			@Override
			public LookupType selectLookupById(final int id) {
				return null;
			}

			@Override
			public LookupType selectLookupByCode(final String type, final String code) {
				return null;
			}

			@Override
			public LookupType selectLookupByDescription(final String type, final String description) {
				return null;
			}

		};
	}

}
