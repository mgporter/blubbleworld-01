export function forEachFilter<T>(
  objects: T[],
  filter: (x: T) => boolean, 
  callbackForPass: (x: T) => void, 
  callbackForReject: (x: T) => void)
{
  objects.forEach(obj => {
    if (filter(obj)) callbackForPass(obj);
    else callbackForReject(obj);
  });
}