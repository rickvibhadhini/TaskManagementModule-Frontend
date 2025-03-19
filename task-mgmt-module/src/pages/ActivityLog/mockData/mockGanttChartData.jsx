import React from "react";

const mockTaskData = {
    "funnelGroups": [
        {
            "funnelName": "SOURCING",
            "tasks": [
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T10:01:00.000+00:00",
                    "taskId": "consent_send_otp",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T10:03:00.000+00:00",
                    "taskId": "consent_send_otp",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T10:05:00.000+00:00",
                    "taskId": "consent_send_otp",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T10:07:00.000+00:00",
                    "taskId": "consent_send_otp",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T10:09:00.000+00:00",
                    "taskId": "consent_verify_otp",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T10:11:00.000+00:00",
                    "taskId": "consent_verify_otp",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T10:13:00.000+00:00",
                    "taskId": "consent_verify_otp",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T10:15:00.000+00:00",
                    "taskId": "consent_verify_otp",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T10:17:00.000+00:00",
                    "taskId": "basic_detail_submit",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T10:19:00.000+00:00",
                    "taskId": "basic_detail_submit",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T10:21:00.000+00:00",
                    "taskId": "basic_detail_submit",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T10:23:00.000+00:00",
                    "taskId": "basic_detail_submit",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T10:25:00.000+00:00",
                    "taskId": "dob_check",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T10:27:00.000+00:00",
                    "taskId": "dob_check",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T10:29:00.000+00:00",
                    "taskId": "dob_check",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T10:31:00.000+00:00",
                    "taskId": "ogl_check",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T10:33:00.000+00:00",
                    "taskId": "ogl_check",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T10:35:00.000+00:00",
                    "taskId": "ogl_check",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T10:37:00.000+00:00",
                    "taskId": "fraud_check",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T10:39:00.000+00:00",
                    "taskId": "fraud_check",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T10:41:00.000+00:00",
                    "taskId": "fraud_check",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T10:43:00.000+00:00",
                    "taskId": "current_address_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T10:45:00.000+00:00",
                    "taskId": "current_address_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T10:47:00.000+00:00",
                    "taskId": "current_address_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T10:49:00.000+00:00",
                    "taskId": "current_address_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T10:51:00.000+00:00",
                    "taskId": "additional_contact_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T10:53:00.000+00:00",
                    "taskId": "additional_contact_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T10:55:00.000+00:00",
                    "taskId": "additional_contact_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T10:57:00.000+00:00",
                    "taskId": "additional_contact_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T10:59:00.000+00:00",
                    "taskId": "personal_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T11:01:00.000+00:00",
                    "taskId": "personal_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T11:03:00.000+00:00",
                    "taskId": "personal_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T11:05:00.000+00:00",
                    "taskId": "personal_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T11:07:00.000+00:00",
                    "taskId": "employment_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T11:09:00.000+00:00",
                    "taskId": "employment_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T11:11:00.000+00:00",
                    "taskId": "employment_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T11:13:00.000+00:00",
                    "taskId": "employment_detail_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T11:15:00.000+00:00",
                    "taskId": "banking_mandatory",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T11:17:00.000+00:00",
                    "taskId": "banking_mandatory",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T11:19:00.000+00:00",
                    "taskId": "banking_mandatory",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T11:21:00.000+00:00",
                    "taskId": "banking_mandatory",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T11:23:00.000+00:00",
                    "taskId": "add_asset",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T11:25:00.000+00:00",
                    "taskId": "add_asset",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T11:27:00.000+00:00",
                    "taskId": "add_asset",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T11:29:00.000+00:00",
                    "taskId": "add_asset",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T11:31:00.000+00:00",
                    "taskId": "cibil_pull",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T11:33:00.000+00:00",
                    "taskId": "cibil_pull",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T11:35:00.000+00:00",
                    "taskId": "cibil_pull",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T11:37:00.000+00:00",
                    "taskId": "init_credit_flow",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T11:39:00.000+00:00",
                    "taskId": "init_credit_flow",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T11:41:00.000+00:00",
                    "taskId": "init_credit_flow",
                    "metadata": {}
                }
            ]
        },
        {
            "funnelName": "CREDIT",
            "tasks": [
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T11:43:00.000+00:00",
                    "taskId": "cibil_pull",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T11:45:00.000+00:00",
                    "taskId": "cibil_pull",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T11:47:00.000+00:00",
                    "taskId": "cibil_pull",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T11:49:00.000+00:00",
                    "taskId": "cars24_cibil_based_offer",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T11:51:00.000+00:00",
                    "taskId": "cars24_cibil_based_offer",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T11:53:00.000+00:00",
                    "taskId": "cars24_cibil_based_offer",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T11:55:00.000+00:00",
                    "taskId": "start_credit_workflow",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T11:57:00.000+00:00",
                    "taskId": "start_credit_workflow",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T11:59:00.000+00:00",
                    "taskId": "start_credit_workflow",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T12:01:00.000+00:00",
                    "taskId": "dc_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T12:03:00.000+00:00",
                    "taskId": "dc_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T12:05:00.000+00:00",
                    "taskId": "dc_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T12:07:00.000+00:00",
                    "taskId": "dc_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T12:09:00.000+00:00",
                    "taskId": "tvr_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T12:11:00.000+00:00",
                    "taskId": "tvr_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T12:13:00.000+00:00",
                    "taskId": "tvr_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T12:15:00.000+00:00",
                    "taskId": "tvr_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T12:17:00.000+00:00",
                    "taskId": "tvr_offer_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T12:19:00.000+00:00",
                    "taskId": "tvr_offer_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T12:21:00.000+00:00",
                    "taskId": "tvr_offer_approve",
                    "metadata": {}
                },
                {
                    "funnel": "CREDIT",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T12:23:00.000+00:00",
                    "taskId": "tvr_offer_approve",
                    "metadata": {}
                }
            ]
        },
        {
            "funnelName": "CONVERSION",
            "tasks": [
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T12:25:00.000+00:00",
                    "taskId": "initiate_offer_approval",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T12:27:00.000+00:00",
                    "taskId": "initiate_offer_approval",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T12:29:00.000+00:00",
                    "taskId": "initiate_offer_approval",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T12:31:00.000+00:00",
                    "taskId": "initiate_offer_approval",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T12:33:00.000+00:00",
                    "taskId": "terms_generation",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T12:35:00.000+00:00",
                    "taskId": "terms_generation",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T12:37:00.000+00:00",
                    "taskId": "terms_generation",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T12:39:00.000+00:00",
                    "taskId": "terms_generation",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T12:41:00.000+00:00",
                    "taskId": "action_on_terms",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T12:43:00.000+00:00",
                    "taskId": "action_on_terms",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T12:45:00.000+00:00",
                    "taskId": "action_on_terms",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T12:47:00.000+00:00",
                    "taskId": "action_on_terms",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T12:49:00.000+00:00",
                    "taskId": "sendback",
                    "metadata": {
                        "sendbackMetadata": {
                            "key": "WRONG_ADDRESS",
                            "status": "INITIATED",
                            "remark": "Address details are incorrect, please update",
                            "sourceAgentId": "42",
                            "initiatedAt": "2025-03-10T12:48:00.000+00:00",
                            "initiatedBy": "John Doe (SUPER_ADMIN ADMIN)",
                            "canValidateSourceSendbackTasks": true,
                            "sourceLoanStage": "DOC_UPLOAD",
                            "sourceSubModule": "DILIGENCE",
                            "targetSubModule": "ADDRESS",
                            "rejectionAllowed": true
                        }
                    }
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T12:51:00.000+00:00",
                    "taskId": "sendback",
                    "metadata": {
                        "sendbackMetadata": {
                            "key": "WRONG_ADDRESS",
                            "status": "INITIATED",
                            "remark": "Address details are incorrect, please update",
                            "sourceAgentId": "42",
                            "initiatedAt": "2025-03-10T12:48:00.000+00:00",
                            "initiatedBy": "John Doe (SUPER_ADMIN ADMIN)",
                            "canValidateSourceSendbackTasks": true,
                            "sourceLoanStage": "DOC_UPLOAD",
                            "sourceSubModule": "DILIGENCE",
                            "targetSubModule": "ADDRESS",
                            "rejectionAllowed": true
                        }
                    }
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T12:53:00.000+00:00",
                    "taskId": "sendback",
                    "metadata": {
                        "sendbackMetadata": {
                            "key": "WRONG_ADDRESS",
                            "status": "INITIATED",
                            "remark": "Address details are incorrect, please update",
                            "sourceAgentId": "42",
                            "initiatedAt": "2025-03-10T12:48:00.000+00:00",
                            "initiatedBy": "John Doe (SUPER_ADMIN ADMIN)",
                            "canValidateSourceSendbackTasks": true,
                            "sourceLoanStage": "DOC_UPLOAD",
                            "sourceSubModule": "DILIGENCE",
                            "targetSubModule": "ADDRESS",
                            "rejectionAllowed": true
                        }
                    }
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T12:55:00.000+00:00",
                    "taskId": "sendback",
                    "metadata": {
                        "sendbackMetadata": {
                            "key": "WRONG_ADDRESS",
                            "status": "INITIATED",
                            "remark": "Address details are incorrect, please update",
                            "sourceAgentId": "42",
                            "initiatedAt": "2025-03-10T12:48:00.000+00:00",
                            "initiatedBy": "John Doe (SUPER_ADMIN ADMIN)",
                            "canValidateSourceSendbackTasks": true,
                            "sourceLoanStage": "DOC_UPLOAD",
                            "sourceSubModule": "DILIGENCE",
                            "targetSubModule": "ADDRESS",
                            "rejectionAllowed": true
                        }
                    }
                }
            ]
        },
        {
            "funnelName": "SOURCING",
            "tasks": [
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T12:57:00.000+00:00",
                    "taskId": "current_address_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T12:59:00.000+00:00",
                    "taskId": "current_address_capture",
                    "metadata": {}
                },
                {
                    "funnel": "SOURCING",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T13:01:00.000+00:00",
                    "taskId": "current_address_capture",
                    "metadata": {}
                }
            ]
        },
        {
            "funnelName": "CONVERSION",
            "tasks": [
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T13:03:00.000+00:00",
                    "taskId": "doc_upload",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T13:05:00.000+00:00",
                    "taskId": "doc_upload",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T13:07:00.000+00:00",
                    "taskId": "doc_upload",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T13:09:00.000+00:00",
                    "taskId": "doc_upload",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T13:11:00.000+00:00",
                    "taskId": "additional_info",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T13:13:00.000+00:00",
                    "taskId": "additional_info",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T13:15:00.000+00:00",
                    "taskId": "additional_info",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T13:17:00.000+00:00",
                    "taskId": "additional_info",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T13:19:00.000+00:00",
                    "taskId": "add_beneficiary_details",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T13:21:00.000+00:00",
                    "taskId": "add_beneficiary_details",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T13:23:00.000+00:00",
                    "taskId": "add_beneficiary_details",
                    "metadata": {}
                },
                {
                    "funnel": "CONVERSION",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T13:25:00.000+00:00",
                    "taskId": "add_beneficiary_details",
                    "metadata": {}
                }
            ]
        },
        {
            "funnelName": "RISK",
            "tasks": [
                {
                    "funnel": "RISK",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T13:27:00.000+00:00",
                    "taskId": "fcu_checks",
                    "metadata": {}
                },
                {
                    "funnel": "RISK",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T13:29:00.000+00:00",
                    "taskId": "fcu_checks",
                    "metadata": {}
                },
                {
                    "funnel": "RISK",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T13:31:00.000+00:00",
                    "taskId": "fcu_checks",
                    "metadata": {}
                },
                {
                    "funnel": "RISK",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T13:33:00.000+00:00",
                    "taskId": "fcu_checks",
                    "metadata": {}
                }
            ]
        },
        {
            "funnelName": "RTO",
            "tasks": [
                {
                    "funnel": "RTO",
                    "actorId": "42",
                    "status": "NEW",
                    "updatedAt": "2025-03-10T13:35:00.000+00:00",
                    "taskId": "rto_completion",
                    "metadata": {}
                },
                {
                    "funnel": "RTO",
                    "actorId": "42",
                    "status": "TODO",
                    "updatedAt": "2025-03-10T13:37:00.000+00:00",
                    "taskId": "rto_completion",
                    "metadata": {}
                },
                {
                    "funnel": "RTO",
                    "actorId": "42",
                    "status": "IN_PROGRESS",
                    "updatedAt": "2025-03-10T13:39:00.000+00:00",
                    "taskId": "rto_completion",
                    "metadata": {}
                },
                {
                    "funnel": "RTO",
                    "actorId": "42",
                    "status": "COMPLETED",
                    "updatedAt": "2025-03-10T13:41:00.000+00:00",
                    "taskId": "rto_completion",
                    "metadata": {}
                }
            ]
        }
    ]
}


export default  mockTaskData;