package org.cmdbuild.services.gis.geoserver.commands;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.cmdbuild.services.gis.geoserver.GeoServerLayer;
import org.cmdbuild.utils.Command;
import org.dom4j.Document;
import org.dom4j.XPath;

public class GetLayer extends AbstractGeoCommand implements Command<GeoServerLayer> {

	private final String name;

	private static final Pattern storeNamePattern = java.util.regex.Pattern.compile("/([^/]+)/(featuretype|coverage)s/[^/]+$");

	public static GeoServerLayer exec(final String name) {
		return new GetLayer(name).run();
	}

	private GetLayer(final String name) {
		super();
		this.name = name;
	}

	@Override
	public GeoServerLayer run() {
		final String url = String.format("%s/rest/layers/%s", getGeoServerURL(), name);
		final Document xmlLayer = get(url);
		final String dataStoreName = extractDataStoreName(xmlLayer);
		return new GeoServerLayer(name, dataStoreName);
	}

	private String extractDataStoreName(final Document xmlLayer) {
		final XPath xpath = xmlLayer.createXPath("//layer/resource/atom:link/@href");
		xpath.setNamespaceURIs(AbstractGeoCommand.atomNS);
		final String featureTypeUrl = xpath.valueOf(xmlLayer);
		Matcher matcher = storeNamePattern.matcher(featureTypeUrl);
		if (matcher.find()) {
			return matcher.group(1);
		} else {
			return null;
		}
	}

}
