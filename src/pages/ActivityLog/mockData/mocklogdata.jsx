import React from 'react'

const mocklogdata = {
    "tasksGroupedByFunnel": {
    "SOURCING": {
        "funnel": "SOURCING",
        "funnelDuration": 0,
        "tasks": [
            {
                "taskId": "consent_send_otp",
                "order": 101,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T10:00:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T10:01:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T10:03:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T10:05:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T10:07:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "consent_verify_otp",
                "order": 103,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T10:08:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T10:09:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T10:11:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T10:13:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T10:15:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "basic_detail_submit",
                "order": 104,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T10:16:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T10:17:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T10:19:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T10:21:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T10:23:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "dob_check",
                "order": 105,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T10:24:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T10:25:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T10:27:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T10:29:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "ogl_check",
                "order": 106,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T10:30:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T10:31:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T10:33:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T10:35:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "fraud_check",
                "order": 109,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T10:36:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T10:37:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T10:39:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T10:41:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "current_address_capture",
                "order": 110,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T10:42:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T10:43:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T10:45:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T10:47:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T10:49:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T12:57:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T12:59:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T13:01:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "additional_contact_detail_capture",
                "order": 111,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T10:50:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T10:51:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T10:53:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T10:55:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T10:57:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "personal_detail_capture",
                "order": 112,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T10:58:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T10:59:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T11:01:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T11:03:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T11:05:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "employment_detail_capture",
                "order": 114,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T11:06:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T11:07:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T11:09:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T11:11:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T11:13:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "banking_mandatory",
                "order": 115,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T11:14:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T11:15:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T11:17:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T11:19:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T11:21:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "add_asset",
                "order": 130,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T11:22:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T11:23:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T11:25:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T11:27:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T11:29:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "init_credit_flow",
                "order": 131,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T11:36:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T11:37:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T11:39:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T11:41:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "cibil_pull",
                "order": 150,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T11:30:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T11:31:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T11:33:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T11:35:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            }
        ]
    },
    "CONVERSION": {
        "funnel": "CONVERSION",
        "funnelDuration": 0,
        "tasks": [
            {
                "taskId": "sendback",
                "order": 110,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:48:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T12:49:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T12:51:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T12:53:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T12:55:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "initiate_offer_approval",
                "order": 301,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:24:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T12:25:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T12:27:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T12:29:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T12:31:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "terms_generation",
                "order": 303,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:32:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T12:33:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T12:35:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T12:37:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T12:39:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "action_on_terms",
                "order": 304,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:40:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T12:41:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T12:43:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T12:45:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T12:47:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "doc_upload",
                "order": 305,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T13:02:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T13:03:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T13:05:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T13:07:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T13:09:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "additional_info",
                "order": 306,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T13:10:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T13:11:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T13:13:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T13:15:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T13:17:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "add_beneficiary_details",
                "order": 307,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T13:18:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T13:19:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T13:21:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T13:23:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T13:25:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            }
        ]
    },
    "CREDIT": {
        "funnel": "CREDIT",
        "funnelDuration": 0,
        "tasks": [
            {
                "taskId": "cibil_pull",
                "order": 201,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T11:42:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T11:43:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T11:45:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T11:47:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "cars24_cibil_based_offer",
                "order": 202,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T11:48:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T11:49:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T11:51:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T11:53:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "start_credit_workflow",
                "order": 203,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T11:54:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T11:55:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T11:57:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T11:59:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "dc_approve",
                "order": 204,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:00:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T12:01:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T12:03:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T12:05:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T12:07:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "tvr_approve",
                "order": 212,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:08:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T12:09:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T12:11:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T12:13:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T12:15:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "tvr_offer_approve",
                "order": 220,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:16:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T12:17:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T12:19:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T12:21:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T12:23:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            }
        ]
    },
    "RISK": {
        "funnel": "RISK",
        "funnelDuration": 0,
        "tasks": [
            {
                "taskId": "fcu_checks",
                "order": 402,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T13:26:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T13:27:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T13:29:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T13:31:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T13:33:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            }
        ]
    },
    "RTO": {
        "funnel": "RTO",
        "funnelDuration": 0,
        "tasks": [
            {
                "taskId": "rto_completion",
                "order": 601,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T13:34:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T13:35:00.000+00:00"
                    },
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T13:37:00.000+00:00"
                    },
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T13:39:00.000+00:00"
                    },
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T13:41:00.000+00:00"
                    }
                ],
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            }
        ]
    },
    "sendbackTasks": {
        "UNKNOWN_REQUEST": [
            {
                "taskId": "sendback",
                "order": 110,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:48:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T12:49:00.000+00:00"
                    }
                ],
                "targetTaskId": null,
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "sendback",
                "order": 110,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:50:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-10T12:51:00.000+00:00"
                    }
                ],
                "targetTaskId": null,
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "sendback",
                "order": 110,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:52:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "IN_PROGRESS",
                        "updatedAt": "2025-03-10T12:53:00.000+00:00"
                    }
                ],
                "targetTaskId": null,
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "sendback",
                "order": 110,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:54:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-10T12:55:00.000+00:00"
                    }
                ],
                "targetTaskId": null,
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "sendback",
                "order": 110,
                "handledBy": "john.doe@cars24.com",
                "createdAt": "2025-03-10T12:48:00.000+00:00",
                "statusHistory": [
                    {
                        "status": "NEW",
                        "updatedAt": "2025-03-10T12:49:00.000+00:00"
                    }
                ],
                "targetTaskId": null,
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            }
        ],
        "b0ae387cc79ce5325025ef0580fe67d0506f5a865c88857dd709527a2b8144e5": [
            {
                "taskId": "sendback",
                "order": 110,
                "handledBy": "hemang.dixit@cars24.com",
                "createdAt": "2025-02-27T16:38:20.895+00:00",
                "statusHistory": [
                    {
                        "status": "TODO",
                        "updatedAt": "2025-03-03T17:28:59.090+00:00"
                    }
                ],
                "targetTaskId": "current_address_capture",
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "sendback",
                "order": 110,
                "handledBy": "hemang.dixit@cars24.com",
                "createdAt": "2025-02-27T16:38:20.895+00:00",
                "statusHistory": [
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-03T17:28:35.379+00:00"
                    }
                ],
                "targetTaskId": "current_address_capture",
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            },
            {
                "taskId": "sendback",
                "order": 110,
                "handledBy": "hemang.dixit@cars24.com",
                "createdAt": "2025-02-27T16:38:20.895+00:00",
                "statusHistory": [
                    {
                        "status": "COMPLETED",
                        "updatedAt": "2025-03-03T17:28:35.205+00:00"
                    }
                ],
                "targetTaskId": "current_address_capture",
                "duration": 0,
                "sendbacks": 0,
                "visited": 0
            }
        ]
    },
    "latestTaskState": {
        "order": 601,
        "handledBy": "john.doe@cars24.com",
        "status": "COMPLETED",
        "duration": 0,
        "updatedAt": "2025-03-10T13:41:00.000+00:00",
        "createdAt": "2025-03-10T13:40:00.000+00:00",
        "taskId": "rto_completion",
        "sendbacks": 0,
        "visited": 0
    }
},
"sendbackTasks": {
    "UNKNOWN_REQUEST": [
        {
            "taskId": "sendback",
            "order": 110,
            "handledBy": "john.doe@cars24.com",
            "createdAt": "2025-03-10T12:48:00.000+00:00",
            "statusHistory": [
                {
                    "status": "NEW",
                    "updatedAt": "2025-03-10T12:49:00.000+00:00"
                }
            ],
            "targetTaskId": null,
            "duration": 0,
            "sendbacks": 0,
            "visited": 0
        },
        {
            "taskId": "sendback",
            "order": 110,
            "handledBy": "john.doe@cars24.com",
            "createdAt": "2025-03-10T12:50:00.000+00:00",
            "statusHistory": [
                {
                    "status": "TODO",
                    "updatedAt": "2025-03-10T12:51:00.000+00:00"
                }
            ],
            "targetTaskId": null,
            "duration": 0,
            "sendbacks": 0,
            "visited": 0
        },
        {
            "taskId": "sendback",
            "order": 110,
            "handledBy": "john.doe@cars24.com",
            "createdAt": "2025-03-10T12:52:00.000+00:00",
            "statusHistory": [
                {
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T12:53:00.000+00:00"
                }
            ],
            "targetTaskId": null,
            "duration": 0,
            "sendbacks": 0,
            "visited": 0
        },
        {
            "taskId": "sendback",
            "order": 110,
            "handledBy": "john.doe@cars24.com",
            "createdAt": "2025-03-10T12:54:00.000+00:00",
            "statusHistory": [
                {
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T12:55:00.000+00:00"
                }
            ],
            "targetTaskId": null,
            "duration": 0,
            "sendbacks": 0,
            "visited": 0
        },
        {
            "taskId": "sendback",
            "order": 110,
            "handledBy": "john.doe@cars24.com",
            "createdAt": "2025-03-10T12:48:00.000+00:00",
            "statusHistory": [
                {
                    "status": "NEW",
                    "updatedAt": "2025-03-10T12:49:00.000+00:00"
                }
            ],
            "targetTaskId": null,
            "duration": 0,
            "sendbacks": 0,
            "visited": 0
        }
    ],
    "b0ae387cc79ce5325025ef0580fe67d0506f5a865c88857dd709527a2b8144e5": [
        {
            "taskId": "sendback",
            "order": 110,
            "handledBy": "hemang.dixit@cars24.com",
            "createdAt": "2025-02-27T16:38:20.895+00:00",
            "statusHistory": [
                {
                    "status": "TODO",
                    "updatedAt": "2025-03-03T17:28:59.090+00:00"
                }
            ],
            "targetTaskId": "current_address_capture",
            "duration": 0,
            "sendbacks": 0,
            "visited": 0
        },
        {
            "taskId": "sendback",
            "order": 110,
            "handledBy": "hemang.dixit@cars24.com",
            "createdAt": "2025-02-27T16:38:20.895+00:00",
            "statusHistory": [
                {
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-03T17:28:35.379+00:00"
                }
            ],
            "targetTaskId": "current_address_capture",
            "duration": 0,
            "sendbacks": 0,
            "visited": 0
        },
        {
            "taskId": "sendback",
            "order": 110,
            "handledBy": "hemang.dixit@cars24.com",
            "createdAt": "2025-02-27T16:38:20.895+00:00",
            "statusHistory": [
                {
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-03T17:28:35.205+00:00"
                }
            ],
            "targetTaskId": "current_address_capture",
            "duration": 0,
            "sendbacks": 0,
            "visited": 0
        }
    ]
},
"latestTaskState": {
    "order": 601,
    "handledBy": "john.doe@cars24.com",
    "status": "COMPLETED",
    "duration": 0,
    "updatedAt": "2025-03-10T13:41:00.000+00:00",
    "createdAt": "2025-03-10T13:40:00.000+00:00",
    "taskId": "rto_completion",
    "sendbacks": 0,
    "visited": 0
}

}


export default mocklogdata;