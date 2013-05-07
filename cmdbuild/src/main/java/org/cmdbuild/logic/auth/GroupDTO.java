package org.cmdbuild.logic.auth;

import org.cmdbuild.common.Builder;

public class GroupDTO {

	public static class GroupDTOBuilder implements Builder<GroupDTO> {

		private Long groupId;
		private String name;
		private String description;
		private String email;
		private String status = "A";
		private Boolean isAdministrator = false;
		private Boolean isRestrictedAdministrator = false;
		private Long startingClassId;

		public GroupDTOBuilder withGroupId(Long groupId) {
			this.groupId = groupId;
			return this;
		}

		public GroupDTOBuilder withName(String name) {
			this.name = name;
			return this;
		}
		
		public GroupDTOBuilder withDescription(String description) {
			this.description = description;
			return this;
		}

		public GroupDTOBuilder withEmail(String email) {
			this.email = email;
			return this;
		}

		public GroupDTOBuilder withStatus(String status) {
			this.status = status;
			return this;
		}

		public GroupDTOBuilder withAdminFlag(Boolean adminFlag) {
			this.isAdministrator = adminFlag;
			return this;
		}

		public GroupDTOBuilder withRestrictedAdminFlag(Boolean restrictedAdmin) {
			this.isRestrictedAdministrator = restrictedAdmin;
			return this;
		}

		public GroupDTOBuilder withStartingClassId(Long startingClassId) {
			this.startingClassId = startingClassId;
			return this;
		}

		@Override
		public GroupDTO build() {
			return new GroupDTO(this);
		}
	}

	public static class GroupDTOCreationValidator implements ModelValidator<GroupDTO> {
		public boolean validate(GroupDTO groupDTO) {
			if (groupDTO.getGroupId() != null || groupDTO.getName() == null) {
				return false;
			}
			return true;
		}
	}

	public static class GroupDTOUpdateValidator implements ModelValidator<GroupDTO> {
		public boolean validate(GroupDTO groupDTO) {
			if(groupDTO.getGroupId() == null) {
				return false;
			}
			return true;
		}
	}

	private Long groupId;
	private String name;
	private String description;
	private String email;
	private String status;
	private Boolean isAdministrator;
	private Boolean isRestrictedAdministrator;
	private Long startingClassId;

	private GroupDTO(GroupDTOBuilder builder) {
		this.groupId = builder.groupId;
		this.name = builder.name;
		this.description = builder.description;
		this.email = builder.email;
		this.status = builder.status;
		this.isAdministrator = builder.isAdministrator;
		this.isRestrictedAdministrator = builder.isRestrictedAdministrator;
		this.startingClassId = builder.startingClassId;
	}

	public static GroupDTOBuilder newInstance() {
		return new GroupDTOBuilder();
	}

	public Long getGroupId() {
		return groupId;
	}

	public String getName() {
		return name;
	}
	
	public String getDescription() {
		return description;
	}

	public String getEmail() {
		return email;
	}

	public String getStatus() {
		return status;
	}

	public Boolean isAdministrator() {
		return isAdministrator;
	}

	public Boolean isRestrictedAdministrator() {
		return isRestrictedAdministrator;
	}

	public Long getStartingClassId() {
		return startingClassId;
	}

}