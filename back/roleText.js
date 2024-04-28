const roleText = {
  President: {
    color: "blue",
    text: "You are the President. You are the leader of the Blue team. When the game ends, the Blue team wins if the President is located in a tent with no terrorists present. You can see the role of the FBI agent.",
  },
  Terrorist: {
    color: "red",
    text: "You are the Terrorist. Your goal is to be in the same tent as the President when the game ends. This will result in a win for the Red team.",
  },
  FBI: {
    color: "blue",
    text: "You are the FBI undercover agent. Your mission is to identify the terrorist. At the end of the game, before the terrorist detonates the bomb, you have one chance to arrest a suspect. If the suspect is the terrorist, the Blue team wins immediately.",
  },
  Collaborator: {
    color: "red",
    text: "You are a Collaborator with the terrorists. Your mission is to help the terrorists succeed in their operation. You know who the terrorist is. Execute the operation strategically.",
  },
  King: {
    color: "grey",
    text: "You are of royal blood. Despite modern society deeming kingship unimportant, you are eager to prove yourself as a true leader. Your goal is to remain the leader of a tent by the time the game ends. Nothing else matters.",
  },
  Resident: {
    color: "grey",
    text: "You have been a resident of this tent for a very long time and do not welcome unexpected visitors. Your goal is to remain in this tent without moving. If you are still in the tent when the game ends, you win. If you have moved, you lose.",
  },
  Blue: {
    color: "blue",
    text: "You are on the Blue team. Your goal is to protect the president from terror. Although you don't know everyone's identity, you must act cleverly to win.",
  },
  Red: {
    color: "red",
    text: "You are on the Red team. Your goal is to disrupt the president's security. Although you don't know everyone's identity, you must act cleverly to win.",
  },
};

module.exports = roleText;
