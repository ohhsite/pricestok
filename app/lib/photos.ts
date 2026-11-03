export const photoName = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;
export function offerPhoto(image: string) {
  return photoName.test(image)
    ? "/api/zdjecia/" + image
    : "/images/" + (image || "pizza") + ".jpg";
}
