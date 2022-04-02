# StackOverflow Answer to [Question][q]

## [Implementing retry logic in node-fetch api call][q]

---

## Answer:


you can check a library that I've published [@teneff/with-retry][1]

to use it you'll have to define error classes like these:

```typescript
class UnexpectedStatus extends Error {
  constructor(readonly status: number) {
    super("Unexpected status returned from API");
  }
}

class ResourceNotFound extends Error {
  constructor() {
    super("Resource not found in API");
  }
}
```

and throw respectively depending on the status code:

```typescript
const getCustomerApplications = async ( custId, headers ) => {
  const result = await fetch(`https://example.com/api/customer/applications/${custId}`, {
    method: "GET",
    headers,
  });

  if (result.status === 404) {
    throw new ResourceNotFound();
  } else if (result.status > 200) {
    throw new UnexpectedStatus(result.status);
  }
  return result;
};
```

and then just use the HOF from the library to wrap your function, with options (how many retries should be attempted and for which errors should it be retrying)

```typescript
const retryWhenReourceNotFoundOrUnexpectedStatus = withRetry({
  errors: [UnexpectedStatus, ResourceNotFound],
  maxCalls: 3,
});

const getCustomerApplicationsWithRetry =
  retryWhenReourceNotFoundOrUnexpectedStatus(getCustomerApplications);

const result = await getCustomerApplicationsWithRetry(1234, {
  Authorization: "Bearer mockToken",
});

```


---
### Option 2

can also be used as decorator
```typescript
class A {
    @withRetry({
        errors: [UnexpectedStatus, ResourceNotFound],
        maxCalls: 3,
    })
    checkApplicationStatus(custId: string,  expectedStatus: string) {
        const response = await fetch(
            `${'env.API_URL'}/api/customer/applications/${custId}`,
            {
                method: 'GET',
                headers: headers,
            },
        )
        if(!response.ok) throw new UnexpectedStatus(response)
        return response
    }
}
```


[1]: https://www.npmjs.com/package/@teneff/with-retry


[q]: https://stackoverflow.com/questions/71705285/implementing-retry-logic-in-node-fetch-api-call
