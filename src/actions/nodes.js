import fetch from 'cross-fetch';
import * as types from '../constants/actionTypes';

const checkNodeStatusStart = (node) => {
  return {
    type: types.CHECK_NODE_STATUS_START,
    node
  };
};

const checkNodeStatusSuccess = (node, res) => {
  return {
    type: types.CHECK_NODE_STATUS_SUCCESS,
    node,
    res
  };
};

const checkNodeStatusFailure = node => {
  return {
    type: types.CHECK_NODE_STATUS_FAILURE,
    node,
  };
};

export function checkNodeStatus(node) {
  return async (dispatch) => {
    try {
      dispatch(checkNodeStatusStart(node));
      const res = await fetch(`${node.url}/api/v1/status`);

      if(res.status >= 400) {
        dispatch(checkNodeStatusFailure(node));
      }

      let json = await res.json();

      const blocksResponse = await fetch(`${node.url}/api/v1/blocks`); //If the Node Status succeed, call the api to retrieve the blocks for this node

      if(blocksResponse.status >= 400) {
        dispatch(checkNodeStatusFailure(node)); //In case of failure, dispatch the same NodeStatusFailure
      }

      const jsonBlocks = await blocksResponse.json(); //Wait for the blocks response
      
      json.blocks = jsonBlocks; //Add Blocks to status node response that we got before

      dispatch(checkNodeStatusSuccess(node, json)); //Dispatch the old response plus the blocks for this node.
    } catch (err) {
      dispatch(checkNodeStatusFailure(node));
    }
  };
}

export function checkNodeStatuses(list) {
  return (dispatch) => {
    list.forEach(node => {
      dispatch(checkNodeStatus(node));
    });
  };
}
