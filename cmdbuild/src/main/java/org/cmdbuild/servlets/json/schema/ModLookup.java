package org.cmdbuild.servlets.json.schema;

import static com.google.common.collect.Iterables.size;
import static org.apache.commons.lang.StringUtils.isNotEmpty;

import java.util.Map;

import org.cmdbuild.exception.AuthException;
import org.cmdbuild.logic.TemporaryObjectsBeforeSpringDI;
import org.cmdbuild.logic.data.lookup.LookupDto;
import org.cmdbuild.logic.data.lookup.LookupLogic;
import org.cmdbuild.logic.data.lookup.LookupTypeDto;
import org.cmdbuild.operation.management.LookupOperation;
import org.cmdbuild.servlets.json.JSONBase;
import org.cmdbuild.servlets.json.serializers.LookupSerializer;
import org.cmdbuild.servlets.utils.Parameter;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Maps;

import static org.cmdbuild.servlets.json.ComunicationConstants.*;

public class ModLookup extends JSONBase {

	@JSONExported
	public JSONArray tree() throws JSONException {
		final Iterable<LookupTypeDto> elements = lookupLogic().getAllTypes();

		final JSONArray jsonLookupTypes = new JSONArray();
		for (final LookupTypeDto element : elements) {
			jsonLookupTypes.put(LookupSerializer.serializeLookupTable(element));
		}

		return jsonLookupTypes;
	}

	@JSONExported
	@Admin
	public JSONObject saveLookupType( //
			final JSONObject serializer, //
			final @Parameter(DESCRIPTION) String type, //
			final @Parameter(ORIG_TYPE) String originalType, //
			final @Parameter(value = PARENT, required = false) String parentType //
	) throws JSONException {
		final LookupTypeDto newType = LookupTypeDto.newInstance().withName(type).withParent(parentType).build();
		final LookupTypeDto oldType = LookupTypeDto.newInstance().withName(originalType).withParent(parentType).build();
		lookupLogic().saveLookupType(newType, oldType);

		final JSONObject jsonLookupType = LookupSerializer.serializeLookupTable(newType);
		serializer.put("lookup", jsonLookupType);
		if (isNotEmpty(originalType)) {
			jsonLookupType.put("oldId", originalType);
		} else {
			serializer.put("isNew", true);
		}
		return serializer;
	}

	@JSONExported
	public JSONObject getLookupList( //
			final JSONObject serializer, //
			final @Parameter(TYPE) String type, //
			final @Parameter(value = START, required = false) int start, //
			final @Parameter(value = LIMIT, required = false) int limit, //
			final @Parameter(ACTIVE) boolean active, //
			final @Parameter(value = SHORT, required = false) boolean shortForm) //
			throws JSONException {
		final LookupTypeDto lookupType = LookupTypeDto.newInstance().withName(type).build();
		final Iterable<LookupDto> elements = lookupLogic().getAllLookup(lookupType, active, start, limit);

		for (final LookupDto element : elements) {
			serializer.append("rows", LookupSerializer.serializeLookup(element, shortForm));
		}
		serializer.put("total", size(elements));
		return serializer;
	}

	@JSONExported
	public JSONObject getParentList( //
			final JSONObject serializer, //
			final LookupOperation lo, //
			final @Parameter(value = TYPE, required = false) String type //
	) throws JSONException, AuthException {
		final LookupTypeDto lookupType = LookupTypeDto.newInstance().withName(type).build();
		final Iterable<LookupDto> elements = lookupLogic().getAllLookupOfParent(lookupType);

		for (final LookupDto lookup : elements) {
			serializer.append("rows", LookupSerializer.serializeLookupParent(lookup));
		}
		return serializer;
	}

	@JSONExported
	@Admin
	public void disableLookup( //
			@Parameter(ID) final int id //
	) throws JSONException {
		lookupLogic().disableLookup(Long.valueOf(id));
	}

	@JSONExported
	@Admin
	public void enableLookup( //
			@Parameter(ID) final int id //
	) throws JSONException {
		lookupLogic().enableLookup(Long.valueOf(id));
	}

	@JSONExported
	@Admin
	public JSONObject saveLookup( //
			final JSONObject serializer, //
			final @Parameter(TYPE_CAPITAL) String type, //
			final @Parameter(CODE_CAPITAL) String code, //
			final @Parameter(DESCRIPTION_CAPITAL) String description, //
			final @Parameter(ID_CAPITAL) int id, //
			final @Parameter(PARENT_ID) int parentId, //
			final @Parameter(NOTES) String notes, //
			final @Parameter(DEFAULT) boolean isDefault, //
			final @Parameter(ACTIVE_CAPITAL) boolean isActive, //
			final @Parameter(NUMBER) int number //
	) throws JSONException {
		final LookupDto lookup = LookupDto.newInstance() //
				.withId(Long.valueOf(id)) //
				.withCode(code) //
				.withDescription(description) //
				.withType(LookupTypeDto.newInstance() //
						.withName(type)) //
				.withParentId(Long.valueOf(parentId)) //
				.withNotes(notes) //
				.withDefaultStatus(isDefault) //
				.withActiveStatus(isActive) //
				.build();
		lookupLogic().createOrUpdateLookup(lookup);

		serializer.put("lookup", LookupSerializer.serializeLookup(lookup));
		return serializer;
	}

	@JSONExported
	@Admin
	public void reorderLookup( //
			final @Parameter(TYPE) String type, //
			final @Parameter(LOOKUP_LIST) JSONArray jsonPositions //
	) throws JSONException, AuthException {
		final LookupTypeDto lookupType = LookupTypeDto.newInstance() //
				.withName(type) //
				.build();
		final Map<Long, Integer> positions = Maps.newHashMap();
		for (int i = 0; i < jsonPositions.length(); i++) {
			final JSONObject jsonElement = jsonPositions.getJSONObject(i);
			positions.put( //
					Long.valueOf(jsonElement.getInt("id")), //
					jsonElement.getInt("index"));
		}
		lookupLogic().reorderLookup(lookupType, positions);
	}

	private LookupLogic lookupLogic() {
		return TemporaryObjectsBeforeSpringDI.getLookupLogic();
	}

}
