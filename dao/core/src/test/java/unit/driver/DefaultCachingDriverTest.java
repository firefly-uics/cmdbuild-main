package unit.driver;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

import org.cmdbuild.dao.driver.CachingDriver;
import org.cmdbuild.dao.driver.DBDriver;
import org.cmdbuild.dao.driver.DefaultCachingDriver;
import org.cmdbuild.dao.entrytype.DBClass;
import org.cmdbuild.dao.entrytype.DBDomain;
import org.cmdbuild.dao.view.DBDataView.DBClassDefinition;
import org.junit.Before;
import org.junit.Test;

public class DefaultCachingDriverTest {

	private DBDriver mockedDriver;
	private CachingDriver cachingDriver;

	@Before
	public void mockDBDriver() throws Exception {
		mockedDriver = mock(DBDriver.class);
		cachingDriver = new DefaultCachingDriver(mockedDriver);
	}

	/*
	 * Classes
	 */

	@Test
	public void allFoundedClassesAreCached() {
		cachingDriver.findAllClasses();
		cachingDriver.findAllClasses();

		verify(mockedDriver, times(1)).findAllClasses();
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void noNeedToFetchClassesAfterCreation() {
		final DBClassDefinition classDefinition = mock(DBClassDefinition.class);

		cachingDriver.findAllClasses();
		cachingDriver.createClass(classDefinition);
		cachingDriver.findAllClasses();

		verify(mockedDriver, times(1)).findAllClasses();
		verify(mockedDriver, times(1)).createClass(classDefinition);
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void noNeedToFetchClassesAfterDeletion() {
		final DBClass dbClass = mock(DBClass.class);

		cachingDriver.findAllClasses();
		cachingDriver.deleteClass(dbClass);
		cachingDriver.findAllClasses();

		verify(mockedDriver, times(1)).findAllClasses();
		verify(mockedDriver, times(1)).deleteClass(dbClass);
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void classesFetchedAgainAfterClassesCacheCleared() {
		cachingDriver.findAllClasses();
		cachingDriver.findAllClasses();
		cachingDriver.clearClassesCache();
		cachingDriver.findAllClasses();

		verify(mockedDriver, times(2)).findAllClasses();
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void classesFetchedAgainAfterAllCacheCleared() {
		cachingDriver.findAllClasses();
		cachingDriver.findAllClasses();
		cachingDriver.clearCache();
		cachingDriver.findAllClasses();

		verify(mockedDriver, times(2)).findAllClasses();
		verifyNoMoreInteractions(mockedDriver);
	}

	/*
	 * Domains
	 */

	@Test
	public void allFoundedDomainsAreCached() {
		cachingDriver.findAllDomains();
		cachingDriver.findAllDomains();

		verify(mockedDriver, times(1)).findAllDomains();
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void noNeedToFetchDomainsAfterCreation() {
		final DBDriver.DomainDefinition domain = mock(DBDriver.DomainDefinition.class);

		cachingDriver.findAllDomains();
		cachingDriver.createDomain(domain);
		cachingDriver.findAllDomains();

		verify(mockedDriver, times(1)).findAllDomains();
		verify(mockedDriver, times(1)).createDomain(domain);
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void noNeedToFetchDomainsWhenAfterDeletion() {
		final DBDomain domain = mock(DBDomain.class);

		cachingDriver.findAllDomains();
		cachingDriver.deleteDomain(domain);
		cachingDriver.findAllDomains();

		verify(mockedDriver, times(1)).findAllDomains();
		verify(mockedDriver, times(1)).deleteDomain(domain);
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void domainsFetchedAgainAfterDomainsCacheCleared() {
		cachingDriver.findAllDomains();
		cachingDriver.findAllDomains();
		cachingDriver.clearDomainsCache();
		cachingDriver.findAllDomains();

		verify(mockedDriver, times(2)).findAllDomains();
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void domainsFetchedAgainAfterAllCacheCleared() {
		cachingDriver.findAllDomains();
		cachingDriver.findAllDomains();
		cachingDriver.clearCache();
		cachingDriver.findAllDomains();

		verify(mockedDriver, times(2)).findAllDomains();
		verifyNoMoreInteractions(mockedDriver);
	}

	/*
	 * Functions
	 */

	@Test
	public void allFoundedFunctionsAreCached() {
		cachingDriver.findAllFunctions();
		cachingDriver.findAllFunctions();

		verify(mockedDriver, times(1)).findAllFunctions();
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void functionsFetchedAgainAfterFunctionsCacheCleared() {
		cachingDriver.findAllFunctions();
		cachingDriver.findAllFunctions();
		cachingDriver.clearFunctionsCache();
		cachingDriver.findAllFunctions();

		verify(mockedDriver, times(2)).findAllFunctions();
		verifyNoMoreInteractions(mockedDriver);
	}

	@Test
	public void functionsFetchedAgainAfterAllCacheCleared() {
		cachingDriver.findAllFunctions();
		cachingDriver.findAllFunctions();
		cachingDriver.clearCache();
		cachingDriver.findAllFunctions();

		verify(mockedDriver, times(2)).findAllFunctions();
		verifyNoMoreInteractions(mockedDriver);
	}

}
