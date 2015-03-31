package org.cmdbuild.service.rest.v2.cxf;

import static java.lang.String.format;

import javax.activation.DataHandler;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import org.apache.cxf.jaxrs.ext.ResponseHandler;
import org.apache.cxf.jaxrs.model.OperationResourceInfo;
import org.apache.cxf.message.Message;
import org.cmdbuild.common.logging.LoggingSupport;

public class HeaderResponseHandler implements ResponseHandler, LoggingSupport {

	@Override
	public Response handleResponse(final Message m, final OperationResourceInfo ori, final Response response) {
		final ResponseBuilder output = Response.fromResponse(response);
		final Object entity = response.getEntity();
		if (entity instanceof DataHandler) {
			final DataHandler dataHandler = DataHandler.class.cast(entity);
			output.header("Content-Disposition", format("inline; filename=\"" + dataHandler.getName() + "\""));
		}
		return output.build();
	}
}