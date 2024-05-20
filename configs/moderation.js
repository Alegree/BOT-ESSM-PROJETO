module.exports.moderation = {
  // true: Enable the Moderation model.
  // false: Disable the Moderation model.
  State: false,
  IgnoredChannels: [
    "0000000000000000000",
    "1111111111111111111",
    "2222222222222222222",
  ],
  IgnoredUsers: [
    "0000000000000000000",
    "1111111111111111111",
    "2222222222222222222",
  ],
  LogChannel: "1218532405372125226",
  LogColor: "Red",
  AdminRoles: [
    "0000000000000000000",
    "1111111111111111111",
    "2222222222222222222",
  ],
  AdminUsers: [
    "336533439534596096",
    "1111111111111111111",
    "2222222222222222222",
  ],
  AutoDelete: {
    Sexual: false,
    Hate: false,
    Harassment: false,
    "Self-Harm": false,
    Violence: false,
  },
  AutoPunish: {
    Sexual: false,
    Hate: false,
    Harassment: false,
    "Self-Harm": false,
    Violence: false,
  },
  AutoPunishType: {
    Sexual: "Timeout",
    Hate: "Timeout",
    Harassment: "Timeout",
    "Self-Harm": "Timeout",
    Violence: "Timeout",
  },
  AutoPunishDuration: {
    Sexual: "1d",
    Hate: "1d",
    Harassment: "1d",
    "Self-Harm": "1d",
    Violence: "1d",
  },
};
