export const ORDER_STATUS = {
  PENDING: 'PEDNING',
  DISPATCH_REQUESTED: 'DISPATCH_REQUESTED',
  DISPATCH_SUCCESSFUL: 'DISPATCH_SUCCESSFUL',
  DISPATCH_FAILED: 'DISPATCH_FAILED',

  possibleTransitions: {
    PENDING: ['DISPATCH_REQUESTED'],
    DISPATCH_REQUESTED: ['DISPATCH_SUCCESSFUL', 'DISPATCH_FAILED'],
    DISPATCH_FAILED: ['DISPATCH_REQUESTED']
  }
};