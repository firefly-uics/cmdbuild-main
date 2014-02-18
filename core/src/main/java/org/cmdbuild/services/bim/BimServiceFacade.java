package org.cmdbuild.services.bim;

import java.io.File;
import java.util.List;
import java.util.Map;

import javax.activation.DataHandler;

import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.model.EntityDefinition;
import org.cmdbuild.bim.service.BimProject;
import org.cmdbuild.model.bim.BimProjectInfo;
import org.joda.time.DateTime;

public interface BimServiceFacade {

	DateTime updateProject(BimProjectInfo projectInfo, File ifcFile);

	String createProject(String projectName);

	void disableProject(String projectId);

	void enableProject(String projectId);

	void updateProject(BimProjectInfo updatedProjectInfo);
	
	List<Entity> readEntityFromProject(EntityDefinition entityDefinition, BimProjectInfo projectInfo);

	String fetchShapeRevision(String shapeName);

	void writeCardIntoProject();

	Iterable<Entity> fetchContainers(String projectId);

	void downloadLastRevisionOfProject(String projectId);

	void createCard(Entity cardData, String projectId, String ifcType, String containerId, String shapeName);
	
	void removeCard(Entity entity, String projectId, String containerKey);

	String commitTransaction();

	String findShapeWithName(String shapeName, String projectId);

	String roidFromPoid(String poid);

	String fetchGlobalIdFromObjectId(String objectId, String revisionId);

	Map<Long, String> fetchAllGlobalId(String revisionId);

	DataHandler fetchProjectStructure(String revisionId);

	BimProject getProjectByName(String name);
	
	BimProject getProjectById(String projectId);

	void branchFromTo(String projectId, String targetProjectId);

	BimProject fetchCorrespondingProjectForExport(String sourceProjectId);

	Iterable<String> fetchAllGlobalIdForIfcType(String string, String identifier);

	Entity fetchEntityFromGlobalId(String revisionId, String globalId);

}
