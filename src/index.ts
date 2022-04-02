import withRetry from "@teneff/with-retry";

class UnexpectedStatus extends Error {
  constructor(readonly status: Response) {
    super("Unexpected status returned from API");
  }
}

class ResourceNotFound extends Error {
  constructor() {
    super("Unexpected status returned from API");
  }
}

import("node-fetch")
  .then(({ default: fetch, Response }) => {
    const getCustomerApplications = async (
      custId: number,
      headers: RequestInit["headers"]
    ) => {
      const result = await fetch(
        `https://example.com/api/customer/applications/${custId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (result.status === 404) {
        throw new ResourceNotFound();
      } else if (result.status > 200) {
        throw new UnexpectedStatus(result);
      }
      return result;
    };

    const retryWhenReourceNotFoundOrUnexpectedStatus = withRetry({
      errors: [UnexpectedStatus, ResourceNotFound],
      maxCalls: 3,
    });

    return retryWhenReourceNotFoundOrUnexpectedStatus(getCustomerApplications);
  })
  .then(async (getCustomerApplicationsWithRetry) => {
    const result = getCustomerApplicationsWithRetry(1234, {
      Authorization: "Bearer mockToken",
    });

    try {
      console.log(await result);
    } catch (err) {
      console.error(err);
    }
  });
