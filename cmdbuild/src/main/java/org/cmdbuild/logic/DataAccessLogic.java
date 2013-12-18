package org.cmdbuild.logic;

import java.util.List;

import org.cmdbuild.common.annotations.Legacy;
import org.cmdbuild.dao.entry.CMCard;
import org.cmdbuild.dao.entrytype.CMClass;
import org.cmdbuild.dao.entrytype.CMDomain;
import org.cmdbuild.dao.legacywrappers.CardWrapper;
import org.cmdbuild.dao.view.CMDataView;
import org.cmdbuild.elements.interfaces.ICard;
import org.cmdbuild.logic.LogicDTO.Card;
import org.cmdbuild.logic.LogicDTO.DomainWithSource;
import org.cmdbuild.logic.commands.GetRelationHistory;
import org.cmdbuild.logic.commands.GetRelationHistory.GetRelationHistoryResponse;
import org.cmdbuild.logic.commands.GetRelationList;
import org.cmdbuild.logic.commands.GetRelationList.GetRelationListResponse;
import org.cmdbuild.services.auth.UserContext;
import org.cmdbuild.services.auth.UserOperations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.google.common.collect.Lists;

/**
 * Business Logic Layer for Data Access
 */
@Component
public class DataAccessLogic implements Logic {

	private final CMDataView view;

	@Autowired
	public DataAccessLogic(@Qualifier("user") final CMDataView view) {
		this.view = view;
	}

	public GetRelationListResponse getRelationList(final Card srcCard, final DomainWithSource dom) {
		return new GetRelationList(view).exec(srcCard, dom);
	}

	public GetRelationHistoryResponse getRelationHistory(final Card srcCard) {
		return new GetRelationHistory(view).exec(srcCard);
	}

	public CMClass findClassById(final Long classId) {
		return view.findClassById(classId);
	}

	@Legacy("IMPORTANT! FIX THE NEW DAO AND FIX BECAUSE IT USES THE SYSTEM USER!")
	public CMCard getCard(final String className, final Object cardId) {
		try {
			final int id = Integer.parseInt(cardId.toString()); // very
			// expensive but
			// almost never
			// called
			final ICard card = UserOperations.from(UserContext.systemContext()).tables().get(className).cards().get(id);
			return new CardWrapper(card);
		} catch (final Exception e) {
			return null;
		}
		/*
		 * The new DAO layer does not query subclasses! **************** final
		 * CMClass cardType = view.findClassByName(className); final
		 * CMQueryResult result = view.select( attribute(cardType,
		 * Constants.DESCRIPTION_ATTRIBUTE)) .from(cardType)
		 * .where(attribute(cardType, Constants.ID_ATTRIBUTE), Operator.EQUALS,
		 * cardId) .run(); if (result.isEmpty()) { return null; } else { return
		 * result.iterator().next().getCard(cardType); }
		 * ***************************************************************
		 */
	}

	/**
	 * Retrieves all domains in which the class with id = classId is involved
	 * (both direct and inverse relation)
	 * 
	 * @param classId
	 *            the class involved in the relation
	 * @return a list of all domains defined for the class
	 */
	public List<CMDomain> findDomainsForClassWithId(final Long classId) {
		final CMClass fetchedClass = view.findClassById(classId);
		if (fetchedClass == null) {
			return Lists.newArrayList();
		}
		return Lists.newArrayList(view.findDomainsFor(fetchedClass));
	}

}