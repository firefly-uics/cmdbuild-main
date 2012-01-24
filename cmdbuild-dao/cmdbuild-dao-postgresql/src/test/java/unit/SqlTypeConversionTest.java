package unit;

import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.core.IsInstanceOf.instanceOf;
import static org.junit.Assert.assertThat;

import org.cmdbuild.dao.driver.postgres.SqlType;
import org.cmdbuild.dao.entrytype.DBAttribute.AttributeMetadata;
import org.cmdbuild.dao.entrytype.attributetype.*;
import org.junit.Ignore;
import org.junit.Test;

public class SqlTypeConversionTest {

	private static final AttributeMetadata NO_META = new AttributeMetadata();

	@Test
	public void supportsBooleanAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("bool", NO_META);
		assertThat(type, instanceOf(BooleanAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.bool));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("bool")));
	}

	@Test
	public void supportsCharAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("bpchar", NO_META);
		assertThat(type, instanceOf(CharAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.bpchar));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("bpchar")));
	}

	@Test
	public void supportsDateAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("date", NO_META);
		assertThat(type, instanceOf(DateAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.date));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("date")));
	}

	@Test
	public void supportsDoubleAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("float8", NO_META);
		assertThat(type, instanceOf(DoubleAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.float8));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("float8")));
	}

	@Ignore
	@Test
	public void supportsGeometryAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("geometry", new AttributeMetadata() {{
			// TODO meta for geometry type
		}});
		assertThat(type, instanceOf(GeometryAttributeType.class));
		// TODO check correct geometry type
		assertThat(SqlType.getSqlType(type), is(SqlType.geometry));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("geometry")));
	}

	@Test
	public void supportsIPAddressAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("inet", NO_META);
		assertThat(type, instanceOf(IPAddressAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.inet));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("inet")));
	}

	@Test
	public void supportsIntegerAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("int4", NO_META);
		assertThat(type, instanceOf(IntegerAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.int4));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("int4")));
	}

	@Test
	public void supportsLookupAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("int4", new AttributeMetadata() {{
			put(AttributeMetadata.LOOKUP_TYPE, "^_^");
		}});
		assertThat(type, instanceOf(LookupAttributeType.class));
		assertThat(((LookupAttributeType) type).lookupTypeName, is("^_^"));
		assertThat(SqlType.getSqlType(type), is(SqlType.int4));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("int4")));
	}

	@Ignore
	@Test
	public void supportsReferenceAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("int4", new AttributeMetadata() {{
			// TODO meta for domain
		}});
		assertThat(type, instanceOf(ReferenceAttributeType.class));
		// TODO check correct domain
		assertThat(SqlType.getSqlType(type), is(SqlType.int4));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("int4")));
	}

	@Ignore
	@Test
	public void supportsForeignKeyAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("int4", new AttributeMetadata() {{
			// TODO meta for target class
		}});
		assertThat(type, instanceOf(ForeignKeyAttributeType.class));
		// TODO check correct target class
		assertThat(SqlType.getSqlType(type), is(SqlType.int4));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("int4")));
	}

	@Test
	public void supportsDecimalAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("numeric(43,21)", NO_META);
		assertThat(type, instanceOf(DecimalAttributeType.class));
		assertThat(((DecimalAttributeType) type).precision, is(43));
		assertThat(((DecimalAttributeType) type).scale, is(21));
		assertThat(SqlType.getSqlType(type), is(SqlType.numeric));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("numeric(43,21)")));
	}

	@Test
	public void supportsEntryTypeAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("regclass", NO_META);
		assertThat(type, instanceOf(EntryTypeAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.regclass));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("regclass")));
	}

	@Test
	public void supportsTextAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("text", NO_META);
		assertThat(type, instanceOf(TextAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.text));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("text")));
	}

	@Test
	public void supportsTimeAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("time", NO_META);
		assertThat(type, instanceOf(TimeAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.time));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("time")));
	}

	@Test
	public void supportsDateTimeAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("timestamp", NO_META);
		assertThat(type, instanceOf(DateTimeAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.timestamp));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("timestamp")));
	}

	@Test
	public void supportsStringAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("varchar(20)", NO_META);
		assertThat(type, instanceOf(StringAttributeType.class));
		assertThat(((StringAttributeType) type).length, is(20));
		assertThat(SqlType.getSqlType(type), is(SqlType.varchar));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("varchar(20)")));
	}

	@Test
	public void doesNotsupportSqlBinaryAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("bytea", NO_META);
		assertThat(type, instanceOf(UndefinedAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.unknown));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("unknown")));
	}

	@Test
	public void doesNotsupportSqlIntegerArrayAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("_int4", NO_META);
		assertThat(type, instanceOf(UndefinedAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.unknown));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("unknown")));
	}

	@Test
	public void doesNotsupportSqlStringArrayAttributes() {
		CMAttributeType<?> type = SqlType.createAttributeType("_varchar", NO_META);
		assertThat(type, instanceOf(UndefinedAttributeType.class));
		assertThat(SqlType.getSqlType(type), is(SqlType.unknown));
		assertThat(SqlType.getSqlTypeString(type), is(equalTo("unknown")));
	}
}
