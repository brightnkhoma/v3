import { ContentType, License, Movie, Pricing } from "../types"

export const maiPath = "https://v1-six-umber.vercel.app" as const
// export const maiPath = "http://localhost:4000" as const
// export const maiPath = "https://mstream-omega.vercel.app" as const


export const DefaultMovie : Movie = {
    views: undefined,
    director: "",
    cast: [],
    duration: 0,
    rating: "",
    genre: "Soundtrack",
    contentId: "",
    ownerId: "",
    title: "",
    description: "",
    releaseDate: new Date(),
    genres: [],
    type: ContentType.MOVIE,
    license: {} as License,
    pricing: {} as Pricing,
    thumbnail: ""
}