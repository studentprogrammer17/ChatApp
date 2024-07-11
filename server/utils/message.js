import moment from 'moment'

export let generateMessage = (from, text) => {
    return {
      from,
      text,
      createdAt: moment().valueOf()
    };
};

export let generateLocationMessage = (from, lat, lng) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${lat}, ${lng}`,
    createdAt: moment().valueOf()
  }
}