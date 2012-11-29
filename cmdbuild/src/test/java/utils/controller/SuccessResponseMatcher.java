package utils.controller;

import org.cmdbuild.services.json.dto.JsonResponse;
import org.hamcrest.Description;
import org.hamcrest.Factory;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

public class SuccessResponseMatcher extends TypeSafeMatcher<JsonResponse> {

	@Override
	public boolean matchesSafely(JsonResponse response) {
		return response.isSuccess();
	}

	public void describeTo(Description description) {
		description.appendText("is not a success");
	}

	@Factory
	public static <T> Matcher<JsonResponse> successResponse() {
		return new SuccessResponseMatcher();
	}
}