package org.cmdbuild.servlets.json.serializers;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.ObjectUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/*
 * This class groups the history items by ID, order them by date (starting
 * with the most recent) and compares the values with the previous item to
 * mark the attributes that have changed
 */
public abstract class JsonHistory {

	protected static class ValueAndDescription {
		private Object value;
		private String description;
		ValueAndDescription(Object value, String description) {
			this.value = value;
			this.description = description;
		}
		Object getValue() {
			return value;
		}
		String getDescription() {
			return description;
		}
	}

	protected interface HistoryItem {
		Object getId();
		long getInstant();
		Map<String,ValueAndDescription> getAttributes();
		Map<String,Object> getExtraAttributes();
		boolean isInOutput();
	}

	private static class ItemTimeline {
		List<HistoryItem> list = new ArrayList<HistoryItem>();

		ItemTimeline() {
		}

		void addHistoryItem(final HistoryItem hi) {
			list.add(hi);
		}

		Iterable<HistoryItem> getItems() {
			Collections.sort(list, new Comparator<HistoryItem>() {
				@Override
				public int compare(HistoryItem hi1, HistoryItem hi2) {
					return Long.signum(hi1.getInstant() - hi2.getInstant());
				}
			});
			return list;
		}
	}

	private Map<Object, ItemTimeline> itemsTimeline = new HashMap<Object, ItemTimeline>();

	protected final void addHistoryItem(HistoryItem hi) {
		final Object id = hi.getId();
		ItemTimeline timeline = itemsTimeline.get(id);
		if (timeline == null) {
			timeline = new ItemTimeline();
			itemsTimeline.put(id, timeline);
		}
		timeline.addHistoryItem(hi);
	}

	public JSONArray toJson() throws JSONException {
		final JSONArray jsonArray = new JSONArray();
		addJsonHistoryItems(jsonArray);
		return jsonArray;
	}

	public void addJsonHistoryItems(final JSONArray jsonArray) throws JSONException {
		for (ItemTimeline timeline : itemsTimeline.values()) {
			HistoryItem previous = null;
			for (HistoryItem current : timeline.getItems()) {
				if (current.isInOutput()) {
					jsonArray.put(historyItemToJson(current, previous));
				}
				previous = current;
			}
		}
	}

	protected final JSONObject historyItemToJson(final HistoryItem current, final HistoryItem previous) throws JSONException {
		JSONObject jsonHistoryItem = new JSONObject();
		for (Map.Entry<String,Object> entry : current.getExtraAttributes().entrySet()) {
			jsonHistoryItem.put(entry.getKey(), entry.getValue());
		}
		jsonHistoryItem.put("Attr", historyItemAttributesToJson(current, previous));
		return jsonHistoryItem;
	}

	private JSONArray historyItemAttributesToJson(final HistoryItem current, final HistoryItem previous) throws JSONException {
		final JSONArray jsonAttr = new JSONArray();
		for (Map.Entry<String,ValueAndDescription> entry : current.getAttributes().entrySet()) {
			final JSONObject jsonAttrValue = new JSONObject();
			final ValueAndDescription vad = entry.getValue();
			final Object currentValue = vad.getValue();
			final String currentDescription = vad.getDescription();
			jsonAttrValue.put("d", currentDescription);
			jsonAttrValue.put("v", currentValue);
			// Add changed field
			if (previous != null) {
				final Object previousValue = previous.getAttributes().get(entry.getKey()).getValue();
				if (theTwoValuesAreDifferent(currentValue, previousValue)) {
					jsonAttrValue.put("c", true);
				}
			}
			jsonAttr.put(jsonAttrValue);
		}
		return jsonAttr;
	}

	public boolean theTwoValuesAreDifferent(Object currentValue, Object previousValue) {
		if (currentValue instanceof JSONObject) {
			currentValue = currentValue.toString();
		}
		if (previousValue instanceof JSONObject) {
			previousValue = previousValue.toString();
		}
		return !ObjectUtils.equals(currentValue, previousValue);
	}
}
