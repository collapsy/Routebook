import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { PlacePhoto } from "./place-photo";

vi.mock("next/image", () => ({
  default: ({ alt, src, onError }: ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} onError={onError} />
  ),
}));
vi.mock("./external-place-image-preview", () => ({
  ExternalPlaceImagePreview: ({ placeName }: { placeName: string }) => (
    <span>Busca externa: {placeName}</span>
  ),
}));
afterEach(cleanup);

it("usa busca externa quando não há imagem curada", () => {
  render(<PlacePhoto placeName="Lugar teste" latitude={1} longitude={2} category="nature" />);
  expect(screen.getByText("Busca externa: Lugar teste")).toBeInTheDocument();
});

it("prioriza a imagem curada e recupera seu erro pela resolução externa", () => {
  render(
    <PlacePhoto
      placeName="Lugar teste"
      latitude={1}
      longitude={2}
      category="nature"
      primaryImage={{
        assetPath: "/test.jpg",
        altText: "Foto curada",
        sourceName: "Curadoria",
        license: "CC0",
      }}
    />,
  );
  expect(screen.queryByText("Busca externa: Lugar teste")).not.toBeInTheDocument();
  fireEvent.error(screen.getByRole("img", { name: "Foto curada" }));
  expect(screen.getByText("Busca externa: Lugar teste")).toBeInTheDocument();
});
