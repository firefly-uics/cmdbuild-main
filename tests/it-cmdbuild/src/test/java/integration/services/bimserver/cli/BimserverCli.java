package integration.services.bimserver.cli;

import java.io.File;
import java.net.URL;
import java.util.List;

import org.cmdbuild.bim.model.Entity;
import org.cmdbuild.bim.service.BimProject;
import org.cmdbuild.bim.service.BimRevision;
import org.cmdbuild.bim.service.BimService;
import org.cmdbuild.bim.service.bimserver.BimserverClient;
import org.cmdbuild.bim.service.bimserver.BimserverClientHolder;
import org.cmdbuild.bim.service.bimserver.BimserverConfiguration;
import org.cmdbuild.bim.service.bimserver.BimserverService;
import org.cmdbuild.bim.service.bimserver.DefaultBimserverClient;
import org.cmdbuild.bim.service.bimserver.SmartBimserverClient;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;

public class BimserverCli {

	private BimService service;
	private BimserverClient client;
	private final String url = "http://localhost:10080";
	private final String username = "admin@tecnoteca.com";
	private final String password = "admin";

	@Before
	public void setUp() {
		BimserverConfiguration configuration = new BimserverConfiguration() {

			@Override
			public boolean isEnabled() {
				return true;
			}

			@Override
			public String getUsername() {
				return username;
			}

			@Override
			public String getUrl() {
				return url;
			}

			@Override
			public String getPassword() {
				return password;
			}

			@Override
			public void addListener(ChangeListener listener) {
			}

			@Override
			public void disable() {
			}
		};
		client = new SmartBimserverClient(new DefaultBimserverClient(configuration));
		service = new BimserverService(client);
	}

	@Test
	public void ping() throws Exception {

	}

	@Test
	public void checkinOnProject() throws Exception {
		String project = "131073";
		String filename = "CMDB_empty.ifc";
		final URL url = ClassLoader.getSystemResource(filename);
		File file = new File(url.toURI());
		System.out.println("Checkin file " + file.getName() + " on project " + project + "...");
		service.checkin(project, file, false);
		System.out.println("File " + file.getName() + " loaded");
	}

	@Test
	public void createProject() throws Exception {
		String projectName = "_cm_Palazzina";
		System.out.println("Creating project " + projectName + "...");
		service.createProject(projectName);
		System.out.println("Project " + service.getProjectByName(projectName) + " created");
	}

	@Test
	public void createProjectAsSubproject() throws Exception {
		String projectName = "_cm_Palazzina_shape1";
		String parentId = "1376257";
		System.out.println("Creating project " + projectName + " as subproject of" + parentId + "...");
		service.createSubProject(projectName, parentId);
		System.out.println("Project " + service.getProjectByName(projectName) + " created");
	}

	@Test
	public void branchToNew() throws Exception {
		String projectName = "CasoDiStudioConShape";
		String projectId = "131073";
		System.out.println("Branching last revision of project " + projectId + " into new project " + projectName
				+ "...");
		String revisionId = service.getProjectByPoid(projectId).getLastRevisionId();
		service.branchToNewProject(revisionId, projectName);
	}

	@Test
	public void branchToExisting() throws Exception {
		String destinationProjectId = "262145";
		String projectId = "131073";
		System.out.println("Branching last revision of project " + projectId + " into project " + destinationProjectId
				+ "...");
		System.out.println("Start branching at " + new DateTime());
		String revisionId = service.getProjectByPoid(projectId).getLastRevisionId();
		System.out.println("Branch created at " + new DateTime());
		service.branchToExistingProject(revisionId, destinationProjectId);
	}

	@Test
	public void downloadLastRevisionOfProject() throws Exception {
		String projectId = "786433";
		System.out.println("Download last revision of project " + projectId + "...");
		service.downloadLastRevisionOfProject(projectId);
	}

	@Test
	public void downloadRevision() throws Exception {
		String revisionId = "393219";
		System.out.println("Download revision " + revisionId + "...");
		service.downloadIfc(revisionId);
		System.out.println("Revision " + revisionId + " downloaded");
	}

	@Test
	public void getObjectsFromRevision() throws Exception {
		String revisionId = "393219";
		String ifcType = "IfcBuilding";

		List<Entity> entityList = service.getEntitiesByType(revisionId, ifcType);
		if (entityList.size() == 0) {
			System.out.println("No objects of type " + ifcType + " found");
		}
		for (Entity e : entityList) {
			System.out.println(e.getKey());
		}

	}

	@Test
	public void getObjectsFromLastRevisionOfProject() throws Exception {
		String projectId = "327681";
		String ifcType = "IfcProductDefinitionShape";

		String revisionId = service.getProjectByPoid(projectId).getLastRevisionId();
		List<Entity> entityList = service.getEntitiesByType(revisionId, ifcType);
		if (entityList.size() == 0) {
			System.out.println("No objects of type " + ifcType + " found");
		} else {
			for (Entity e : entityList) {
				System.out.println(e.getKey());
			}
		}
	}

	@Test
	public void list() throws Exception {
		System.out.println("\n\n\n");
		for (BimProject project : service.getAllProjects()) {
			System.out.println("\n" + project);
			List<BimRevision> revisions = service.getRevisionsOfProject(project);
			if (revisions == null || revisions.size() == 0) {
				System.out.println("- no revisions");
			}
			for (BimRevision revision : revisions) {
				System.out.println("* revisionId " + revision.getIdentifier() + "   date " + revision.getDate());
			}
		}
	}

	@Test
	public void setUpForExport() throws Exception {
		for (BimProject project : service.getAllProjects()) {
			if (project.getName().equals("INT-Store") || project.getName().startsWith("_cm")) {
				continue;
			}
			String wipProjectId = service.createProject("_cm_" + project.getName()).getIdentifier();
			String shapeProjectId = service.createSubProject("shapes", wipProjectId).getIdentifier();
			String shape1ProjectId = service.createSubProject("shape1", shapeProjectId).getIdentifier();
			String filename = "cuboShape.ifc";
			final URL url = ClassLoader.getSystemResource(filename);
			File file = new File(url.toURI());
			System.out.println("Checkin file " + file.getName() + " on project " + project + "...");
			service.checkin(shape1ProjectId, file);
		}
	}

}
