import { store } from "../../index";
import * as actions from "./index";

export function isOpen() {
  return store.current.dispatch(actions.getOpenState());
}

export function isVisible() {
  return store.current.dispatch(actions.getVisibleState());
}

export function initialize() {
  store.current.dispatch(actions.initialize());
}

export function connect() {
  store.current.dispatch(actions.connectServer());
}

export function disconnect() {
  store.current.dispatch(actions.disconnectServer());
}

export function addUserMessage(text) {
  console.log(store.current);

  store.current.dispatch(actions.addUserMessage(text));
}

export function emitUserMessage(text) {
  store.current.dispatch(actions.emitUserMessage(text));
}

export function addResponseMessage(text) {
  store.current.dispatch(actions.addResponseMessage(text));
}

export function addCarousel(carousel) {
  store.current.dispatch(actions.addCarousel(carousel));
}

export function addVideoSnippet(video) {
  store.current.dispatch(actions.addVideoSnippet(video));
}

export function addImageSnippet(image) {
  store.current.dispatch(actions.addImageSnippet(image));
}

export function addButtons(buttons) {
  store.current.dispatch(actions.addButtons(buttons));
}

export function setButtons(id, title) {
  store.current.dispatch(actions.setButtons(id, title));
}

export function insertUserMessage(id, text) {
  store.current.dispatch(actions.insertUserMessage(id, text));
}

export function renderCustomComponent(component, props, showAvatar = false) {
  store.current.dispatch(actions.renderCustomComponent(component, props, showAvatar));
}

export function openChat() {
  store.current.dispatch(actions.openChat());
}

export function closeChat() {
  store.current.dispatch(actions.closeChat());
}

export function toggleChat() {
  store.current.dispatch(actions.toggleChat());
}

export function showChat() {
  store.current.dispatch(actions.showChat());
}

export function hideChat() {
  store.current.dispatch(actions.hideChat());
}

export function toggleFullScreen() {
  store.current.dispatch(actions.toggleFullScreen());
}

export function toggleInputDisabled(disable) {
  store.current.dispatch(actions.toggleInputDisabled(disable));
}

export function dropMessages() {
  store.current.dispatch(actions.dropMessages());
}

export function pullSession() {
  store.current.dispatch(actions.pullSession());
}

export function newUnreadMessage() {
  store.current.dispatch(actions.newUnreadMessage());
}

export function send(playload, text = "", customStore) {
  if (customStore) {
    customStore.dispatch(actions.emitUserMessage(playload));
    if (text !== "") customStore.dispatch(actions.addUserMessage(text));
    return;
  }
  store.current.dispatch(actions.emitUserMessage(playload));
  if (text !== "") store.current.dispatch(actions.addUserMessage(text));
}
