package de.tum.in.www1.artemis.service.connectors.localci.dto;

import java.io.Serial;
import java.io.Serializable;

public class LocalCIBuildJobQueueItem implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long participationId;

    private String commitHash;

    private Long expirationTime;

    public LocalCIBuildJobQueueItem(Long participationId, String commitHash) {
        this.participationId = participationId;
        this.commitHash = commitHash;
        this.expirationTime = 0L;
    }

    public Long getParticipationId() {
        return participationId;
    }

    public void setParticipationId(Long participationId) {
        this.participationId = participationId;
    }

    public String getCommitHash() {
        return commitHash;
    }

    public void setCommitHash(String commitHash) {
        this.commitHash = commitHash;
    }

    public Long getExpirationTime() {
        return expirationTime;
    }

    public void setExpirationTime(Long expirationTime) {
        this.expirationTime = expirationTime;
    }

    @Override
    public String toString() {
        return "LocalCIBuildJobQueueItem{" + "participationId='" + participationId + '\'' + ", commitHash='" + commitHash + '\'' + '}';
    }
}
