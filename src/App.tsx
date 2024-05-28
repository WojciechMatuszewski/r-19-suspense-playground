import clsx from "clsx";
import {
  ComponentProps,
  Suspense,
  startTransition,
  use,
  useDeferredValue,
  useId,
  useOptimistic
} from "react";

import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useSearchParams
} from "react-router-dom";

import { Pokedex, Pokemon } from "pokeapi-js-wrapper";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

const pokedex = new Pokedex();

function App() {
  return (
    <Layout>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Home} />
        </Routes>
      </BrowserRouter>
    </Layout>
  );
}

export default App;

function Layout({ children }: { children: React.ReactNode }) {
  return <main className={"max-w-lg w-full m-auto p-6 prose"}>{children}</main>;
}

function Home() {
  return (
    <>
      <SearchForm />
      <PopularSearches />
      <div className={"flex justify-center py-5"}>
        <Suspense
          fallback={
            <div className={"flex gap-2 flex-col"}>
              <div className={"skeleton h-[24px] w-full"} />
              <div className={"skeleton w-[128px] h-[128px]"} />
            </div>
          }
        >
          <ErrorBoundary FallbackComponent={PokemonDetailError}>
            <PokemonDetail />
          </ErrorBoundary>
        </Suspense>
      </div>
    </>
  );
}

function SearchForm() {
  const searchInputId = useId();

  const [query, setQuery] = useSearchParamsQuery();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);

  return (
    <search>
      <span>{optimisticQuery}</span>
      <form
        action={(formData) => {
          const searchQuery = formData.get("search") as string;
          setOptimisticQuery(searchQuery);

          setQuery(searchQuery);
        }}
      >
        <div className={"sr-only"}>
          <label htmlFor={searchInputId}>Search for pokemon</label>
        </div>

        <div className={"flex w-full gap-2"}>
          <input
            defaultValue={query}
            key={query}
            type="search"
            name="search"
            placeholder={"Search for pokemon"}
            className={"input input-bordered flex-1"}
          />

          <button className={"btn btn-primary"}>Search</button>
        </div>
      </form>
    </search>
  );
}

function PopularSearches() {
  const popularPokemons = ["Pikachu", "Ditto", "Charizard"];

  return (
    <nav>
      <ul className={"flex gap-3 items-center list-none m-0 p-0 my-3"}>
        {popularPokemons.map((popularPokemon) => {
          return (
            <li key={popularPokemon} className={"m-0 p-0"}>
              <PopularSearch pokemonName={popularPokemon} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function PopularSearch({ pokemonName }: { pokemonName: string }) {
  const [query] = useSearchParamsQuery();

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const normalizedPokemonName = pokemonName.toLocaleLowerCase();

  const isActive = normalizedQuery === normalizedPokemonName;

  return (
    <Link
      className={clsx("btn", { "btn-active": isActive })}
      to={{ search: `?q=${pokemonName}` }}
      unstable_viewTransition={true}
    >
      {pokemonName}
    </Link>
  );
}

function PokemonDetail() {
  const [query] = useSearchParamsQuery();
  const deferredQuery = useDeferredValue(query);

  const isPending = deferredQuery !== query;

  const isEmpty = deferredQuery === "";
  if (isEmpty) {
    return <div>Search...</div>;
  }

  const pokemon = use(fetchPokemon(deferredQuery));
  const imgSrc = pokemon.sprites.front_default ?? "/placeholder.png";

  return (
    <section
      className={clsx("transition-opacity opacity-100", {
        "opacity-50": isPending
      })}
    >
      <h2 className={"text-center m-0"}>{pokemon.name}</h2>
      <ErrorBoundary
        key={deferredQuery}
        fallback={<img src={imgSrc} className={"w-[128px] h-[128px]"} />}
      >
        <Suspense
          fallback={<div className={"skeleton w-[128px] h-[128px] mt-2"}></div>}
        >
          <PokemonDetailImage src={imgSrc} />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}

function PokemonDetailImage({
  src = "",
  ...restOfProps
}: ComponentProps<"img">) {
  const fetchedSrc = use(fetchPokemonImageSrc(src));

  return (
    <img
      {...restOfProps}
      className={"m-0 p-0 w-[128px] h-[128px]"}
      src={fetchedSrc}
    ></img>
  );
}

function PokemonDetailError({ error }: FallbackProps) {
  const [query] = useSearchParamsQuery();

  const isNotFound = error.response.status === 404;
  if (isNotFound) {
    return (
      <div role="alert" className="alert alert-warning">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>
          Pokemon <code>{query}</code> not found
        </span>
      </div>
    );
  }

  return (
    <div role="alert" className="alert alert-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Error. Please try again</span>
    </div>
  );
}

function useSearchParamsQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const setQuery = (query: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("q", query.trim());

    setSearchParams(params);
  };

  return [query, setQuery] as const;
}

const pokemonCache = new Map<string, Promise<Pokemon>>();

function fetchPokemon(name: string) {
  const normalizedName = name.trim().toLocaleLowerCase();

  const pokemonPromise =
    pokemonCache.get(normalizedName) ??
    pokedex.getPokemonByName(normalizedName);

  pokemonCache.set(normalizedName, pokemonPromise);

  return pokemonPromise;
}

const pokemonImageCache = new Map<string, Promise<string>>();

function fetchPokemonImageSrc(src: string) {
  const imgSrcPromise =
    pokemonImageCache.get(src) ?? createPokemonImagePromise(src);

  pokemonImageCache.set(src, imgSrcPromise);

  return imgSrcPromise;
}

function createPokemonImagePromise(src: string) {
  const img = new Image();

  return new Promise<string>((resolve, reject) => {
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = reject;
  });
}
