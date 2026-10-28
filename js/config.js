
(() => {
  const mainApi =
    "https://script.google.com/macros/s/AKfycbyvn7_FB1cp0oTMGzHYEKCEw58Czarc1xVEDQDta4a9Traa3Xpmzt7xR-DrlBuV1OdZ/exec";

  const eventsApi =
    "https://script.google.com/macros/s/AKfycbwPW66dhlpKT8Npf_YJ6yj9JcoJ3Z9O2Kl5aH-XhN9LQI31o9KrF3iVoRq6zSqOdWbOjA/exec";

  const membersApi =
    "https://script.google.com/macros/s/AKfycbzKCwRLU7LwQh3abivCoit2BhwZ0KGHtkLWkou_axOYbmb52ooIqURJcBNraEd-JQu3/exec";

  const mediaApi =
    "https://script.google.com/macros/s/AKfycbxIEL_zgLSHaadD0WcaQx3cIJHePMQtiBCeORa7tCpyHWF7vE4fAO9sgqStGRCg95Ja/exec";

  window.SHERPAS_CONFIG = Object.freeze({
    MAIN_API: mainApi,
    TEAM_API: mainApi,
    ANNOUNCEMENTS_API: mainApi,
    FORM_API: mainApi,
    EDIT_MEMBER_API: mainApi,
    MESSAGES_API: mainApi,

    EVENTS_API: eventsApi,
    ADMIN_API: eventsApi,
    EVENTS_ADMIN_API: eventsApi,

    MEMBERS_API: membersApi,

    MEDIA_API: mediaApi,
    GALLERY_API: mediaApi,
    HERO_VIDEO_API: mediaApi
  });
})();
