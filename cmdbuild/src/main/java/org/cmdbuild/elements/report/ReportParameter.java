package org.cmdbuild.elements.report;

import java.sql.Time;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;

import groovy.lang.GroovyShell;
import groovy.lang.Script;
import net.sf.jasperreports.engine.JRParameter;
import net.sf.jasperreports.engine.JRPropertiesMap;

import org.cmdbuild.elements.AttributeImpl;
import org.cmdbuild.elements.interfaces.IAttribute;
import org.cmdbuild.elements.interfaces.ITable;
import org.cmdbuild.elements.interfaces.ITableFactory;
import org.cmdbuild.elements.interfaces.IAttribute.AttributeType;
import org.cmdbuild.exception.ReportException.ReportExceptionType;

/**
 * 
 * Container for user-defined Jasper Parameter
 * 
 * AVAILABLE FORMATS FOR JRPARAMETER NAME 1) reference: "label.class.attribute"
 * - ie: User.Users.Description 2) lookup: "label.lookup.lookuptype" - ie:
 * Brand.Lookup.Brands 3) simple: "label" - ie: My parameter
 * 
 * Notes: - The description property overrides the label value - Reference or
 * lookup parameters will always be integers while simple parameters will match
 * original parameter class - All custom parameters are required; set a property
 * with name="required" and value="false" to override
 * 
 */

public abstract class ReportParameter {

	private JRParameter jrParameter;
	private Object parameterValue;
	protected static final String regExpLR = "[\\w\\s]*\\.\\w*\\.[\\w\\s]*"; // regular
																				// expression
																				// matching
																				// lookup
																				// and
																				// reference
																				// parameters
																				// format

	public static ReportParameter parseJrParameter(JRParameter jrParameter) {
		if (jrParameter == null || jrParameter.getName() == null || jrParameter.getName().equals("")) {
			throw ReportExceptionType.REPORT_INVALID_PARAMETER_FORMAT.createException();
		}
		String iReportParamName = jrParameter.getName();
		if (iReportParamName.indexOf(".") == -1) {
			return new RPSimple(jrParameter);
		} else {
			if (!iReportParamName.matches(regExpLR)) {
				throw ReportExceptionType.REPORT_INVALID_PARAMETER_FORMAT.createException();
			}
			String[] split = iReportParamName.split("\\.");
			if (split[1].equalsIgnoreCase("lookup")) {
				return new RPLookup(jrParameter);
			} else {
				return new RPReference(jrParameter);
			}
		}
	}

	protected final IAttribute createCMDBuildAttribute(ITableFactory tf, AttributeType type) {
		IAttribute attribute = AttributeImpl.create(tf.get(ITable.BaseTable), getFullName(), type);
		if (getDescription() != null && !getDescription().equals("")) {
			attribute.setDescription(getDescription());
		} else {
			attribute.setDescription(getName());
		}
		attribute.setNotNull(isRequired());
		return attribute;
	}

	abstract public IAttribute createCMDBuildAttribute(ITableFactory tf);

	public String getDefaultValue() {
		if (jrParameter.getDefaultValueExpression() != null) {
			GroovyShell shell = new GroovyShell();
			Script sc = shell.parse(jrParameter.getDefaultValueExpression().getText());
			Object result = sc.run();

			if (result != null) {
				// date
				if (jrParameter.getValueClass() == Date.class) {
					SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
					return sdf.format(result);
				}

				// timestamp
				else if (jrParameter.getValueClass() == Timestamp.class || jrParameter.getValueClass() == Time.class) {
					SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yy HH:mm:ss");
					return sdf.format(result);
				}

				// other
				return result.toString();

			}
		}
		return null;
	}

	public boolean hasDefaultValue() {
		return (jrParameter.getDefaultValueExpression() != null
				&& jrParameter.getDefaultValueExpression().getText() != null && !jrParameter
				.getDefaultValueExpression().getText().equals(""));
	}

	public void setJrParameter(JRParameter jrParameter) {
		this.jrParameter = jrParameter;
	}

	public JRParameter getJrParameter() {
		return jrParameter;
	}

	public String getName() {
		return getFullNameSplit()[0];
	}

	public String getFullName() {
		return jrParameter.getName();
	}

	public String[] getFullNameSplit() {
		return getFullName().split("\\.");
	}

	public String getDescription() {
		return jrParameter.getDescription();
	}

	public void parseValue(String newValue) {
		setValue(newValue);
	}

	public void setValue(Object parameterValue) {
		this.parameterValue = parameterValue;
	}

	public Object getValue() {
		return parameterValue;
	}

	public boolean isRequired() {
		JRPropertiesMap properties = jrParameter.getPropertiesMap();
		String required = properties.getProperty("required");
		if (required != null && required.equalsIgnoreCase("false")) {
			return false;
		}
		return true;
	}

}