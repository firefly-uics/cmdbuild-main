package org.cmdbuild.service.rest.v1;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.cmdbuild.service.rest.v1.constants.Serialization.ACTIVE;
import static org.cmdbuild.service.rest.v1.constants.Serialization.LIMIT;
import static org.cmdbuild.service.rest.v1.constants.Serialization.PROCESS_ID;
import static org.cmdbuild.service.rest.v1.constants.Serialization.START;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import org.cmdbuild.service.rest.v1.model.Attribute;
import org.cmdbuild.service.rest.v1.model.ResponseMultiple;

@Path("processes/{" + PROCESS_ID + "}/attributes/")
@Produces(APPLICATION_JSON)
public interface ProcessAttributes {

	@GET
	@Path(EMPTY)
	ResponseMultiple<Attribute> readAll( //
			@PathParam(PROCESS_ID) String processId, //
			@QueryParam(ACTIVE) boolean activeOnly, //
			@QueryParam(LIMIT) Integer limit, //
			@QueryParam(START) Integer offset //
	);

}
