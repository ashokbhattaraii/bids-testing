export default {
  splitBlood: blood => {
    let rh_factor = blood.match(/\+|-/);
    rh_factor = rh_factor[0].toString();
    let group = blood.replace(/\+|-/, "");
    return { rh_factor, group };
  }
};
