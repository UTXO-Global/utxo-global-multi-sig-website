export const event = ({ action, ...params }: any) => {
  (window as any).gtag("event", action, {
    ...params,
  });
};
