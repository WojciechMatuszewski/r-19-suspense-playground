# Learnings

- It seems like the `v7_startTransition: true` on the router does not do what I want.

  - While it will suspend route transitions, it will also make it so the UI "lags" in places when I update the `searchParams`.

    - This is not what I want. I want to be fully in control of that.

    - Having said that, this is the behavior React documentation recommends.

TODO: explore how `action` on a form works. I had to use `useOptimistic` to get the freshest `query` result into the UI. Why?

- It seems like React will "freeze" the UI
