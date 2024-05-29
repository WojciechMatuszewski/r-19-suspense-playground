# Learnings

- It seems like the `v7_startTransition: true` on the router does not do what I want.

  - While it will suspend route transitions, it will also make it so the UI "lags" in places when I update the `searchParams`.

    - This is not what I want. I want to be fully in control of that.

    - Having said that, this is the behavior React documentation recommends.

- When using the `action` on a form, the component rendering that form did not update its JSX until all the _Suspended_ components resolved. Why?

  - The [React documentation](https://react.dev/reference/react/useOptimistic#use) mentions that one should use `useOptimistic` to display a _different_ state while _async action_ is underway.

    - I'm confused since the action I'm performing is NOT async – it changes query parameters on the URL.

  - I **think it is because the `form` is no longer a "simple" HTML tag, but rather a complex component**.

    - [This blog post](https://jser.dev/2024-03-20-how-does-useoptimisticwork-internally-in-react/#44-form-now-accepts-async-action) appears to confirm my suspicion. **The form will "hold" the old inner JSX until the action is resolved**.

      > <form/> accepts an async action, when it is submitted, <form/> will have a new state hook internally, and a global transition is started for the async action until it is completed.

    Since the _granularity_ of updates in React is _per-component_, React will hold onto the "old" JSX of the component that renders the `form` tag.

- How do I show pending UI in completely unrelated part of the app when submitting a form via `action`?

  - I **did not find any other way than moving the `useActionState` to the parent**.

  - I do not like this pattern. What if I had a ton of stuff in-between the form and the component displaying the data?
